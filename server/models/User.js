const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  rollNumber: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  password: { type: String, required: true }, // Hashed
  plainPassword: { type: String }, // OPTIONAL: Only store this temporarily if you need to print them later. Ideally, remove this in production.
  role: { type: String, enum: ['admin', 'student'], default: 'student' },
  hasSubmitted: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);