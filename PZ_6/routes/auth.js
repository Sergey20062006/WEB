const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

// РЕЄСТРАЦІЯ
router.post('/register',
  // Верифікація даних 
  body('email').isEmail().withMessage('Введіть коректний email').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Пароль має бути мінімум 8 символів'),
  body('name').notEmpty().trim().escape(),
  body('role').isIn(['supplier', 'consumer', 'broker']).withMessage('Невірна роль'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, name, role } = req.body;

      // Перевіряємо, чи немає вже такого email в базі
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Користувач з таким email вже існує' });
      }

      // Хешуємо пароль
      const hashedPassword = await bcrypt.hash(password, 10);

      // Створюємо нового користувача в базі
      const user = await User.create({
        email,
        password: hashedPassword,
        name,
        role
      });

      res.status(201).json({
        message: 'Реєстрація успішна',
        user: { id: user.id, email: user.email, role: user.role }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ЛОГІН
router.post('/login',
  // Передаємо роботу Passport.js
  passport.authenticate('local'),
  (req, res) => {
    res.json({
      message: 'Вхід успішний',
      user: {
        id: req.user.id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role
      }
    });
  }
);

// ЛОГАУТ (ВИХІД) 
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: 'Вихід успішний' });
  });
});

// ІНФОРМАЦІЯ ПРО ПОТОЧНОГО КОРИСТУВАЧА ---
router.get('/me', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      name: req.user.name,
      role: req.user.role
    });
  } else {
    res.status(401).json({ error: 'Не авторизовано' });
  }
});

module.exports = router;