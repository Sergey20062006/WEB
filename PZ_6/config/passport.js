const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
// Пiдключаємо модель користувача
const User = require('../models/User');

//правило для логiну
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async (email, password, done) => {
    try {
      // 1. Шукаємо користувача за email
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: 'Невiрний email' });
      }
      
      // 2. Якщо знайшли - порiвнюємо пароль з хешем у базi
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Невiрний пароль' });
      }
      
      // 3. Якщо все супер - пропускаємо користувача
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

// "Запам'ятовуємо" користувача в сесiї
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// "Згадуємо" користувача 
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});