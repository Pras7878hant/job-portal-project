import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
     try {
          let token;

          // 1. Check for token in Authorization header (Bearer token)
          if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
               token = req.headers.authorization.split(' ')[1];
          } else if (req.cookies.token) {
               // 2. Fallback to checking for token in httpOnly cookie
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

          // If jwt.verify throws an error, the catch block will handle it.
          // If it succeeds, decode will contain the payload.
          // You've already got a check if (!decode) but jwt.verify
          // usually throws for invalid tokens, making this check redundant.
          // I'll keep it for now as it doesn't harm, but be aware.
          if (!decode) {
               return res.status(401).json({
                    message: "Invalid token (decode failed)",
                    success: false
               });
          }

          req.id = decode.userId; // Attach userId from token payload to request object
          req.role = decode.role; // **THIS IS THE NEW CRUCIAL LINE** - Attach role from token payload
          next(); // Proceed to the next middleware/controller
     } catch (error) {
          // Log the specific JWT verification error for debugging
          console.error('JWT Verification Error in isAuthenticated middleware:', error.message);

          // Send a 401 response for any verification failure
          return res.status(401).json({
               message: "Invalid or expired token",
               success: false
          });
     }
};

export default isAuthenticated;