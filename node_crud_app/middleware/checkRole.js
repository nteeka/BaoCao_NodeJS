
const checkUserRole = (requiredRole) => {
    return (req, res, next) => {
      // Assuming user information is stored in the session
      const userRole = req.session.roleName; // Adjust this based on your actual user data structure
  
      if (userRole === requiredRole) {
        // User has the required role, allow access to the next middleware or route
        next();
      } else {
        // User does not have the required role, redirect or send an error response
        res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have the required role to access this page.'
          });
      }
    };
  };

module.exports = checkUserRole;