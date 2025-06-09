const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const {
  createUser,
  findUserByEmail,
  findUserByUsername,
  comparePassword
} = require('../models/user.model');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email et password sont obligatoires' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    const existingEmail = findUserByEmail(email);
    const existingUsername = findUserByUsername(username);

    if (existingEmail || existingUsername) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email ou username existe déjà'
      });
    }

    const userId = await createUser({
      username,
      email,
      password,
      role: role || 'Responsable Qualité'
    });

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: { id: userId, username, email, role: role || 'Responsable Qualité' }
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la création',
      error: error.message
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username et password sont obligatoires' });
    }

    const user = findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la connexion',
      error: error.message
    });
  }
});

module.exports = router;
