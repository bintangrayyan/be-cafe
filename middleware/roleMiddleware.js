const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        status: false,
        message: 'Access denied. User not authenticated.',
      });
    }

    const userRole = req.user.role;

    if (allowedRoles.includes(userRole)) {
      next();
    } else {
      return res.status(403).json({
        status: false,
        message: 'Access denied. User role is not authorized.',
      });
    }
  };
};

module.exports = roleMiddleware;
