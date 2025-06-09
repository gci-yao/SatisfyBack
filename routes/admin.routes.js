const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middlewares/auth.middleware');
const { Parser } = require('json2csv');
const ExcelJS = require('exceljs');

// Protéger toutes les routes
router.use(authMiddleware);

// GET /api/admin/responses - paginées
router.get('/responses', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const total = db.prepare('SELECT COUNT(*) AS count FROM responses').get().count;

    const responses = db.prepare(`
      SELECT * FROM responses
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    res.json({
      responses,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur pagination:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/admin/statistics
router.get('/statistics', (req, res) => {
  try {
    const total = db.prepare('SELECT COUNT(*) AS count FROM responses').get().count;
    const satisfaits = db.prepare("SELECT COUNT(*) AS count FROM responses WHERE satisfaction = 'Satisfait'").get().count;
    const mecontents = db.prepare("SELECT COUNT(*) AS count FROM responses WHERE satisfaction = 'Mécontent'").get().count;

    const motifs = db.prepare(`
      SELECT motif, COUNT(*) AS count
      FROM responses
      GROUP BY motif
      ORDER BY count DESC
    `).all();

    const services = db.prepare(`
      SELECT service, COUNT(*) AS count
      FROM responses
      GROUP BY service
      ORDER BY count DESC
      LIMIT 10
    `).all();

    res.json({
      total,
      satisfaction: {
        satisfaits,
        mecontents,
        pourcentageSatisfaits: total > 0 ? Math.round((satisfaits / total) * 100) : 0
      },
      motifs,
      topServices: services
    });
  } catch (error) {
    console.error('Erreur statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/admin/export?format=csv|excel
router.get('/export', (req, res) => {
  try {
    const format = req.query.format || 'csv';

    const responses = db.prepare('SELECT * FROM responses ORDER BY createdAt DESC').all();

    const data = responses.map(r => ({
      'Date de visite': new Date(r.visitDate).toLocaleDateString('fr-FR'),
      'Nom': r.nom,
      'Email': r.email,
      'Téléphone': r.telephone,
      'Motif': r.motif,
      'Satisfaction': r.satisfaction,
      'Service': r.service,
      'Commentaire': r.commentaire,
      'Date de soumission': new Date(r.createdAt).toLocaleDateString('fr-FR')
    }));

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Réponses');

      worksheet.columns = Object.keys(data[0] || {}).map(key => ({
        header: key,
        key,
        width: 20
      }));

      data.forEach(row => worksheet.addRow(row));
      worksheet.getRow(1).font = { bold: true };

      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=satisfyme-responses-${Date.now()}.xlsx`
      );

      workbook.xlsx.write(res).then(() => res.end());
    } else {
      const parser = new Parser();
      const csv = parser.parse(data);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=satisfyme-responses-${Date.now()}.csv`);
      res.send(csv);
    }
  } catch (error) {
    console.error("Erreur export:", error);
    res.status(500).json({ message: 'Erreur export', error: error.message });
  }
});

module.exports = router;
