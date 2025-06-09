const jwt = require('jsonwebtoken');
const db = require('../database/db');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = db
      .prepare('SELECT id, username, email, role FROM users WHERE id = ?')
      .get(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Token invalide. Utilisateur introuvable.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur authMiddleware:', error.message);
    return res.status(401).json({ message: 'Token invalide ou expiré.' });
  }
};

module.exports = authMiddleware;
