const axios = require('axios');
const User = require('../../models/User');

const verifySiret = async (req, res) => {
  try {
    const { siret } = req.body;

    if (!siret || siret.length !== 14) {
      return res.status(400).json({ 
        message: 'SIRET invalide (14 chiffres requis)' 
      });
    }

    // Check if SIRET already exists in database
    const existingUser = await User.findOne({ siret });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Ce SIRET est déjà utilisé par un autre professionnel' 
      });
    }

    // Verify SIRET with INSEE API if API key is configured
    if (process.env.SIRENE_API_KEY) {
      try {
        const response = await axios.get(
          `https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.SIRENE_API_KEY}`,
              'Accept': 'application/json',
            },
            timeout: 10000,
          }
        );

        if (response.data && response.data.etablissement) {
          const etablissement = response.data.etablissement;
          
          // Check if establishment is active
          if (etablissement.etatAdministratifEtablissement !== 'A') {
            return res.status(400).json({ 
              message: 'Cet établissement n\'est pas actif' 
            });
          }

          // Return company information
          return res.json({
            valid: true,
            companyInfo: {
              siret: etablissement.siret,
              siren: etablissement.siren,
              companyName: etablissement.uniteLegale?.denominationUniteLegale || 
                          `${etablissement.uniteLegale?.prenom1UniteLegale || ''} ${etablissement.uniteLegale?.nomUniteLegale || ''}`.trim(),
              address: {
                street: `${etablissement.numeroVoieEtablissement || ''} ${etablissement.typeVoieEtablissement || ''} ${etablissement.libelleVoieEtablissement || ''}`.trim(),
                city: etablissement.libelleCommuneEtablissement,
                zipCode: etablissement.codePostalEtablissement,
              },
              activity: etablissement.activitePrincipaleEtablissement,
              activityLabel: etablissement.nomenclatureActivitePrincipale,
            }
          });
        } else {
          return res.status(404).json({ 
            message: 'SIRET non trouvé dans la base INSEE' 
          });
        }
      } catch (apiError) {
        console.error('INSEE API Error:', apiError.message);
        
        if (apiError.response?.status === 404) {
          return res.status(404).json({ 
            message: 'SIRET non trouvé dans la base INSEE' 
          });
        }
        
        // If API fails, continue with basic validation
        console.warn('INSEE API unavailable, using basic SIRET validation');
      }
    }

    // Basic SIRET validation algorithm (Luhn algorithm)
    const isValidSiret = validateSiretChecksum(siret);
    
    if (!isValidSiret) {
      return res.status(400).json({ 
        message: 'SIRET invalide (échec de la vérification)' 
      });
    }

    // Return basic validation success
    res.json({
      valid: true,
      message: 'SIRET valide (vérification de base)',
      companyInfo: null, // No company info without API
    });

  } catch (error) {
    console.error('SIRET verification error:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la vérification du SIRET',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Basic SIRET validation using Luhn algorithm
const validateSiretChecksum = (siret) => {
  try {
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      let digit = parseInt(siret[i]);
      if (i % 2 === 1) {
        digit *= 2;
        if (digit > 9) {
          digit = Math.floor(digit / 10) + (digit % 10);
        }
      }
      sum += digit;
    }
    
    const checkDigit = (10 - (sum % 10)) % 10;
    return checkDigit === parseInt(siret[13]);
  } catch (error) {
    return false;
  }
};

module.exports = verifySiret;
