// Middleware to restrict pro-only features to users with active subscription
const requireProActive = (req, res, next) => {
  if (req.user.role !== 'pro') {
    return res.status(403).json({ message: 'Compte professionnel requis' });
  }
  if (!req.user.hasActiveSubscription()) {
    return res
      .status(403)
      .json({ message: 'Abonnement pro requis pour cette action' });
  }
  next();
};

module.exports = { requireProActive };
