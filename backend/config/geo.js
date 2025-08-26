const axios = require('axios');

// Nominatim geocoding service
const geocodeAddress = async (address) => {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&countrycodes=fr`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Bookauto/1.0 (contact@bookauto.com)'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        display_name: result.display_name
      };
    }
    
    return null;
  } catch (error) {
    console.error('❌ Geocoding failed:', error.message);
    return null;
  }
};

// Haversine formula to calculate distance between two points
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

// Convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

// Find professionals within radius
const findProsInRadius = (userLat, userLng, professionals, radiusKm = 50) => {
  return professionals
    .map(pro => {
      if (!pro.latitude || !pro.longitude) return null;
      
      const distance = calculateDistance(userLat, userLng, pro.latitude, pro.longitude);
      return {
        ...pro.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal
      };
    })
    .filter(pro => pro && pro.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

module.exports = {
  geocodeAddress,
  calculateDistance,
  findProsInRadius,
  toRadians
};
