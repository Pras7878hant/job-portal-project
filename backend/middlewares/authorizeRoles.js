export const authorizeRoles = (roles) => {
     return (req, res, next) => {

          if (!req.role || !roles.includes(req.role)) {
               return res.status(403).json({
                    message: `Forbidden: Your role (${req.role || 'undefined'}) is not authorized to access this resource.`,
                    success: false
               });
          }
          next();
     };
};