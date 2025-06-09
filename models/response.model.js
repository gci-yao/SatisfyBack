const db = require('../database/db');

// Créer une nouvelle réponse
const createResponse = (data) => {
  const {
    visitDate = new Date().toISOString(),
    nom,
    email,
    telephone,
    motif,
    satisfaction,
    service,
    commentaire = ''
  } = data;

  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO responses (
      visitDate, nom, email, telephone, motif,
      satisfaction, service, commentaire,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(
    visitDate,
    nom.trim(),
    email.trim().toLowerCase(),
    telephone.trim(),
    motif,
    satisfaction,
    service.trim(),
    commentaire.trim(),
    now,
    now
  );

  return info.lastInsertRowid;
};

// Récupérer toutes les réponses
const getAllResponses = () => {
  return db.prepare('SELECT * FROM responses ORDER BY createdAt DESC').all();
};

// Récupérer une réponse par ID
const getResponseById = (id) => {
  return db.prepare('SELECT * FROM responses WHERE id = ?').get(id);
};

module.exports = {
  createResponse,
  getAllResponses,
  getResponseById
};
