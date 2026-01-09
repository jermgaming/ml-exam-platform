const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  rollNumber: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // Hashed
  plainPassword: { type: String }, // Stored for admin visibility
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  hasSubmitted: { type: Boolean, default: false },
  last_login_at: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('User', UserSchema);