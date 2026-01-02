const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const xlsx = require('xlsx');
const crypto = require('crypto');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

// 1. LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { rollNumber, password } = req.body;
  try {
    const user = await User.findOne({ rollNumber });
    if (!user) return res.status(400).json({ msg: 'User not found' });

    // In a real app, use bcrypt.compare. For simplicity of the "generated password" workflow:
    // We are comparing plain text here because the admin generates random plain strings.
    // Ideally: Hash the input and compare with DB hash.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id, role: user.role } };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '4h' }, (err, token) => {
      if (err) throw err;
      res.json({ token, role: user.role });
    });
  } catch (err) {
    res.status(500).send('Server Error');
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
        user.name = nameVal; // Update name just in case
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

    res.json({ msg: 'Students processed', students: processedUsers });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
module.exports = router;