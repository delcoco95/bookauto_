const express = require('express');
const router = express.Router();
const axios = require('axios');

// Luhn check on first 9 digits (SIREN)
function isValidSiren(siren) {
  if (!/^\d{9}$/.test(siren)) return false;
  if (siren === '356000000') return true; // La Poste exception
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    let n = parseInt(siren[i]);
    if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
}

// POST /api/siret/verify
router.post('/verify', async (req, res) => {
  try {
    const { siret } = req.body;
    if (!siret || !/^\d{14}$/.test(siret)) {
      return res.status(400).json({ valid: false, message: 'Le numéro SIRET doit contenir exactement 14 chiffres.' });
    }

    const siren = siret.substring(0, 9);
    if (!isValidSiren(siren)) {
      return res.status(400).json({ valid: false, message: 'Numéro SIRET invalide (contrôle Luhn échoué).' });
    }

    // Try free French government API
    try {
      const response = await axios.get(
        `https://recherche-entreprises.api.gouv.fr/search?q=${siret}&page=1&per_page=1`,
        { timeout: 5000 }
      );
      const results = response.data?.results;
      if (results && results.length > 0) {
        const company = results[0];
        return res.json({
          valid: true,
          companyName: company.nom_raison_sociale || company.nom_complet || '',
          address: company.siege?.adresse || '',
          city: company.siege?.commune || '',
          zipCode: company.siege?.code_postal || '',
          activity: company.activite_principale || '',
        });
      }
    } catch (apiError) {
      console.log('API Gouv unavailable, using Luhn validation only');
    }

    // Fallback: SIRET format is valid (Luhn passed)
    return res.json({ valid: true, companyName: '', message: 'Format SIRET valide (vérification API indisponible).' });
  } catch (error) {
    console.error('SIRET verify error:', error);
    res.status(500).json({ valid: false, message: 'Erreur lors de la vérification du SIRET.' });
  }
});

module.exports = router;
