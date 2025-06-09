const express = require('express');
const router = express.Router();
const { createResponse } = require('../models/response.model');

// POST /api/responses - Créer une réponse (public)
router.post('/responses', (req, res) => {
  try {
    const { visitDate, contact, motif, satisfaction, service, commentaire } = req.body;

    if (!visitDate || !contact || !motif || !satisfaction || !service) {
      return res.status(400).json({ message: 'Tous les champs obligatoires doivent être remplis' });
    }

    const motifsValides = ['Information', 'Prise de sang (Bilan)', 'Retrait de résultat'];
    const satisfactionsValides = ['Satisfait', 'Mécontent'];

    if (!motifsValides.includes(motif)) {
      return res.status(400).json({ message: 'Motif invalide' });
    }

    if (!satisfactionsValides.includes(satisfaction)) {
      return res.status(400).json({ message: 'Niveau de satisfaction invalide' });
    }

    if (!contact.nom || !contact.email || !contact.telephone) {
      return res.status(400).json({ message: 'Les informations de contact sont incomplètes' });
    }

    // Utilisation de la fonction personnalisée pour SQLite
    const id = createResponse({
      visitDate,
      nom: contact.nom,
      email: contact.email,
      telephone: contact.telephone,
      motif,
      satisfaction,
      service,
      commentaire: commentaire || ''
    });

    res.status(201).json({
      message: 'Réponse enregistrée avec succès',
      responseId: id
    });
  } catch (error) {
    console.error('Erreur lors de la création de la réponse:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'enregistrement',
      error: error.message
    });
  }
});

// GET /api/responses - Récupérer toutes les réponses (public)
router.get('/responses', (req, res) => {
  try {
    const responses = require('../models/response.model').getAllResponses();
    res.json(responses);
  } catch (error) {
    console.error('Erreur lors de la récupération des réponses:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET /api/responses/:id - Récupérer une réponse par ID (public)
router.get('/responses/:id', (req, res) => {
  try {
    const id = req.params.id;
    const response = require('../models/response.model').getResponseById(id);
    res.json(response);
  } catch (error) {
    console.error('Erreur lors de la récupération de la réponse:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
