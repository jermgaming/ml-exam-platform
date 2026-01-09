const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');
const crypto = require('crypto');
const fs = require('fs');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// 1. LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;
  console.log('Login attempt for:', rollNumber);

  try {
    const user = await User.findOne({ rollNumber });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    await User.findByIdAndUpdate(user._id, {
      last_login_at: new Date()
    });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Include name and rollNumber in token for display in frontend
    const payload = { user: { id: user.id, role: user.role, name: user.name, rollNumber: user.rollNumber } };

    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// 2. ADMIN: UPLOAD STUDENTS & GENERATE PASSWORDS
router.post('/upload', [auth, upload.single('file')], async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access Denied' });

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    const processedUsers = [];

    for (const row of data) {
      // 1. Find columns roughly matching Name/RollNo
      const nameVal = row['Name'] || row['name'] || row['Student Name'];
      const rollVal = row['RollNumber'] || row['Roll Number'] || row['rollNumber'];

      if (!nameVal || !rollVal) continue;

      // 2. Generate NEW Password
      const rawPassword = crypto.randomBytes(3).toString('hex');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(rawPassword, salt);

      // 3. Check if user exists
      let user = await User.findOne({ rollNumber: rollVal });

      if (user) {
        // UPDATE existing user with NEW password
        user.password = hashedPassword;
        user.plainPassword = rawPassword;
        user.name = nameVal;
        await user.save();
      } else {
        // CREATE new user
        user = new User({
          name: nameVal,
          rollNumber: rollVal,
          password: hashedPassword,
          plainPassword: rawPassword,
          role: 'student'
        });
        await user.save();
      }

      // 4. Add to the list that gets sent to Frontend
      processedUsers.push({
        name: nameVal,
        rollNumber: rollVal,
        password: rawPassword
      });
    }

    // Clean up uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Failed to delete uploaded file:', err);
    });

    res.json({ msg: 'Students processed', students: processedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// 3. ADMIN: GET ALL STUDENTS WITH LOGIN STATUS
router.get('/students', auth, async (req, res) => {
  // 1. Security Check: Only Admin can see this list
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Access Denied' });
  }

  try {
    // 2. Fetch all users who are students
    const students = await User.find({ role: 'student' })
      .select('-password') // Exclude the hashed password (security best practice)
      .sort({ rollNumber: 1 }); // Sort by roll number

    // 3. Define "Online" Threshold (e.g., 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

    // 4. Process the list to add the "isOnline" boolean
    const studentList = students.map(student => {
      // Check if last_login_at exists AND is recent
      const isOnline = student.last_login_at && student.last_login_at > tenMinutesAgo;

      return {
        _id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
        password: student.plainPassword || 'Not Generated',
        lastLogin: student.last_login_at,
        isOnline: isOnline
      };
    });

    res.json(studentList);

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;