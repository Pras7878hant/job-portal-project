// C:\Users\prash\OneDrive\Desktop\web college progect\backend\middlewares\authorizeRoles.js

export const authorizeRoles = (roles) => {
     return (req, res, next) => {
          // req.role should be set by the isAuthenticated middleware
          if (!req.role || !roles.includes(req.role)) {
               return res.status(403).json({
                    message: `Forbidden: Your role (${req.role || 'undefined'}) is not authorized to access this resource.`,
                    success: false
               });
          }
          next();
     };
};