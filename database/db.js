const path = require('path');
const Database = require('better-sqlite3');

const dbPath = path.resolve(__dirname, 'satisfyme.db');
const db = new Database(dbPath);


db.exec(`
  CREATE TABLE IF NOT EXISTS responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitDate TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT NOT NULL,
    motif TEXT NOT NULL CHECK (motif IN ('Information', 'Prise de sang (Bilan)', 'Retrait de résultat')),
    satisfaction TEXT NOT NULL CHECK (satisfaction IN ('Satisfait', 'Mécontent')),
    service TEXT NOT NULL,
    commentaire TEXT DEFAULT '',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// Création de la table users
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Responsable Qualité', 'Directrice Générale')) DEFAULT 'Responsable Qualité',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );
`);

module.exports = db;
