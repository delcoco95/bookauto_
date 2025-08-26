const express = require('express');
const { query, validationResult } = require('express-validator');
const Service = require('../models/Service');
const User = require('../models/User');
const { geocodeAddress, findProsInRadius } = require('../config/geo');

const router = express.Router();

// Search services with geolocation
router.get('/', [
  query('location').optional().trim(),
  query('category').optional().isIn(['auto', 'plomberie', 'serrurerie']),
  query('subCategory').optional().trim(),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('radiusKm').optional().isInt({ min: 5, max: 100 }),
  query('ratingMin').optional().isFloat({ min: 0, max: 5 }),
  query('date').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      location,
      category,
      subCategory,
      lat,
      lng,
      radiusKm = 25,
      ratingMin = 0,
      date,
      page = 1,
      limit = 20,
    } = req.query;

    let userLat = parseFloat(lat);
    let userLng = parseFloat(lng);

    // Geocode location if provided but no coordinates
    if (location && (!userLat || !userLng)) {
      const geoData = await geocodeAddress(location);
      if (geoData) {
        userLat = geoData.lat;
        userLng = geoData.lng;
      } else {
        return res.status(400).json({ 
          message: 'Impossible de localiser cette adresse' 
        });
      }
    }

    // Build service filter
    const serviceFilter = { isActive: true };
    if (category) serviceFilter.category = category;
    if (subCategory) serviceFilter.subCategory = subCategory;

    // Find services matching criteria
    const services = await Service.find(serviceFilter)
      .populate({
        path: 'proId',
        match: {
          isActive: true,
          subscriptionStatus: { $in: ['active', 'trialing'] },
          ...(ratingMin > 0 && { averageRating: { $gte: ratingMin } }),
        },
        select: 'firstName lastName companyName averageRating totalReviews latitude longitude serviceRadius categories',
      });

    // Filter out services where pro didn't match criteria
    const validServices = services.filter(service => service.proId);

    // Group services by professional
    const proServicesMap = new Map();
    validServices.forEach(service => {
      const proId = service.proId._id.toString();
      if (!proServicesMap.has(proId)) {
        proServicesMap.set(proId, {
          pro: service.proId,
          services: [],
        });
      }
      proServicesMap.get(proId).services.push(service);
    });

    let results = Array.from(proServicesMap.values());

    // Apply geolocation filtering if coordinates provided
    if (userLat && userLng) {
      results = results.filter(result => {
        const pro = result.pro;
        if (!pro.latitude || !pro.longitude) return false;
        
        const distance = require('../config/geo').calculateDistance(
          userLat, userLng, pro.latitude, pro.longitude
        );
        
        // Check if within pro's service radius and search radius
        const withinProRadius = distance <= (pro.serviceRadius || 30);
        const withinSearchRadius = distance <= radiusKm;
        
        if (withinProRadius && withinSearchRadius) {
          result.distance = Math.round(distance * 10) / 10;
          return true;
        }
        return false;
      });

      // Sort by distance if location-based search
      results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } else {
      // Sort by rating if no location
      results.sort((a, b) => (b.pro.averageRating || 0) - (a.pro.averageRating || 0));
    }

    // Handle fallback: if no results for subcategory, try category only
    if (results.length === 0 && subCategory && category) {
      console.log(`No results for subCategory "${subCategory}", trying category "${category}" fallback`);
      
      const fallbackFilter = { 
        isActive: true, 
        category 
        // Remove subCategory filter for fallback
      };

      const fallbackServices = await Service.find(fallbackFilter)
        .populate({
          path: 'proId',
          match: {
            isActive: true,
            subscriptionStatus: { $in: ['active', 'trialing'] },
            ...(ratingMin > 0 && { averageRating: { $gte: ratingMin } }),
          },
          select: 'firstName lastName companyName averageRating totalReviews latitude longitude serviceRadius categories',
        });

      const fallbackValidServices = fallbackServices.filter(service => service.proId);
      
      const fallbackProServicesMap = new Map();
      fallbackValidServices.forEach(service => {
        const proId = service.proId._id.toString();
        if (!fallbackProServicesMap.has(proId)) {
          fallbackProServicesMap.set(proId, {
            pro: service.proId,
            services: [],
          });
        }
        fallbackProServicesMap.get(proId).services.push(service);
      });

      results = Array.from(fallbackProServicesMap.values());

      // Apply same filtering and sorting for fallback
      if (userLat && userLng) {
        results = results.filter(result => {
          const pro = result.pro;
          if (!pro.latitude || !pro.longitude) return false;
          
          const distance = require('../config/geo').calculateDistance(
            userLat, userLng, pro.latitude, pro.longitude
          );
          
          const withinProRadius = distance <= (pro.serviceRadius || 30);
          const withinSearchRadius = distance <= radiusKm;
          
          if (withinProRadius && withinSearchRadius) {
            result.distance = Math.round(distance * 10) / 10;
            return true;
          }
          return false;
        });

        results.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      } else {
        results.sort((a, b) => (b.pro.averageRating || 0) - (a.pro.averageRating || 0));
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedResults = results.slice(startIndex, endIndex);

    res.json({
      professionals: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: results.length,
        pages: Math.ceil(results.length / limit),
        hasMore: endIndex < results.length,
      },
      searchCriteria: {
        location,
        category,
        subCategory,
        coordinates: userLat && userLng ? { lat: userLat, lng: userLng } : null,
        radiusKm: parseInt(radiusKm),
        ratingMin: parseFloat(ratingMin),
      },
    });

  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ message: 'Erreur lors de la recherche' });
  }
});

// Get service by ID
router.get('/:id', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('proId', 'firstName lastName companyName averageRating totalReviews companyAddress phone');

    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Erreur lors du chargement du service' });
  }
});

module.exports = router;
