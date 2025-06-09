const db = require('../database/db');
const bcrypt = require('bcryptjs');

const createUser = async ({ username, email, password, role = 'Responsable Qualité' }) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (username, email, password, role, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const info = stmt.run(username.trim(), email.trim().toLowerCase(), hashedPassword, role, now, now);
  return info.lastInsertRowid;
};

const findUserByUsername = (username) => {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username.trim());
};

const findUserByEmail = (email) => {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email.trim().toLowerCase());
};

const comparePassword = async (plain, hash) => {
  return bcrypt.compare(plain, hash);
};

// add a new user admin
if (!findUserByEmail('a@b.com'))
  createUser({
    username: 'admin',
    email: 'a@b.com',
    password: 'password',
    role: 'Directrice Générale'
  });

module.exports = {
  createUser,
  findUserByEmail,
  findUserByUsername,
  comparePassword
};
