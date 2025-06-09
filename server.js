const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./database/db'); // initialisation de la base SQLite
const responseRoutes = require('./routes/response.routes');
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', responseRoutes);       // POST /api/responses
app.use('/api/auth', authRoutes);      // POST /api/auth/login, register
app.use('/api/admin', adminRoutes);    // admin stats, export, secured

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API SatisfyMe fonctionnelle avec SQLite 🎉' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
});

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});
