import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
     try {
          let token;

          // 1. Check for token in Authorization header
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
               token = req.headers.authorization.split(' ')[1];
          } else if (req.cookies.token) {
               token = req.cookies.token;
          }

          if (!token) {
               return res.status(401).json({
                    message: "User not authenticated / Token missing",
                    success: false,
               });
          }

          // Log the token being verified for debugging
          console.log('Attempting to verify token:', token);

          const decode = jwt.verify(token, process.env.SECRET_KEY);

          if (!decode) {
               return res.status(401).json({
                    message: "Invalid token (decode failed)",
                    success: false
               });
          }

          req.id = decode.userId;
          req.role = decode.role;
          next();
     } catch (error) {

          return res.status(401).json({
               message: "Invalid or expired token",
               success: false
          });
     }
};

export default isAuthenticated;