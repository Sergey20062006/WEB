const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { isAuthenticated, hasRole } = require('../middleware/auth');

const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10, 
  message: { error: 'Забагато транзакцій. Спробуйте пізніше.' }
});

// ПЕРЕГЛЯД ЦІН 
router.get('/market/prices', isAuthenticated, (req, res) => {
  res.json({
    message: 'Поточні ціни на ринку електроенергії',
    prices: {
      peakHour: '3.50 грн/кВт',
      offPeakHour: '1.80 грн/кВт'
    }
  });
});

// СТВОРЕННЯ ПРОПОЗИЦІЇ НА ПРОДАЖ
// ТІЛЬКИ постачальників (supplier)
router.post('/offers', isAuthenticated, hasRole('supplier'), transactionLimiter, (req, res) => {
  const { amount, price } = req.body;
  
  if (!amount || amount <= 0 || !price || price <= 0) {
    return res.status(400).json({ error: 'Некоректні дані пропозиції (Anti-fraud перевірка не пройдена)' });
  }

  res.status(201).json({
    message: 'Пропозицію на продаж успішно створено',
    offer: { amount, price, supplierId: req.user.id }
  });
});

// СТВОРЕННЯ ЗАЯВКИ НА КУПІВЛЮ 
// ТІЛЬКИ споживачів (consumer)
router.post('/bids', isAuthenticated, hasRole('consumer'), transactionLimiter, (req, res) => {
  const { amount, maxPrice } = req.body;

  if (!amount || amount <= 0 || !maxPrice || maxPrice <= 0) {
    return res.status(400).json({ error: 'Некоректні дані заявки' });
  }

  res.status(201).json({
    message: 'Заявку на купівлю успішно створено',
    bid: { amount, maxPrice, consumerId: req.user.id }
  });
});

// УСТАНОВЛЕННЯ УГОДИ 
// ТІЛЬКИ брокерів (broker)
router.post('/deals', isAuthenticated, hasRole('broker'), transactionLimiter, (req, res) => {
  const { offerId, bidId, confirmationCode } = req.body;

  if (!confirmationCode) {
     return res.status(400).json({ error: 'Потрібен код підтвердження для безпеки угоди' });
  }

  res.status(201).json({
    message: 'Угоду успішно укладено',
    deal: { offerId, bidId, brokerId: req.user.id, status: 'Completed' }
  });
});

module.exports = router;