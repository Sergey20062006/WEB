// Перевірка, чи користувач взагалі увійшов у систему
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // Якщо так - пропускаємо далі
  }
  res.status(401).json({ error: 'Необхідна автентифікація' });
}

// Перевірка, чи має користувач потрібну роль
function hasRole(...roles) {
  return (req, res, next) => {
    // Спочатку перевіряємо, чи він залогінений
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Необхідна автентифікація' });
    }
    // Потім перевіряємо, чи його роль є у списку
    if (roles.includes(req.user.role)) {
      return next();
    }
    res.status(403).json({ error: 'Недостатньо прав доступу' });
  };
}

module.exports = { isAuthenticated, hasRole };