require('dotenv').config();

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');

// Підключаємо налаштування Passport
require('./config/passport');

const app = express();

// ПІДКЛЮЧЕННЯ ДО БАЗИ ДАНИХ (MongoDB)
mongoose.connect('mongodb://127.0.0.1:27017/energy')
  .then(() => console.log('Успішно підключено до бази даних MongoDB!'))
  .catch((err) => console.error('Помилка підключення до бази:', err));

// БЕЗПЕКА ТА НАЛАШТУВАННЯ 
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:3000', // Дозволяємо запити з нашого ж сайту
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- НАЛАШТУВАННЯ СЕСІЙ ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// ІНІЦІАЛІЗАЦІЯ ПАСПОРТНОГО КОНТРОЛЮ
app.use(passport.initialize());
app.use(passport.session());

// Відкриваємо доступ до папки public(HTML-сторінки)
app.use(express.static('public'));

// ПІДКЛЮЧЕННЯ МАРШРУТІВ 
// Всі запити, що починаються з /auth, відправляємо у файл routes/auth.js
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
  console.log(`Відкрийте в браузері: http://localhost:${PORT}`);
});