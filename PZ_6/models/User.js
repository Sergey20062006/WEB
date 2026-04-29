const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true, // Обов'язкове поле
    unique: true    // Має бути унікальним (не можна 2 акаунти на 1 пошту)
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['supplier', 'consumer', 'broker'], 
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);