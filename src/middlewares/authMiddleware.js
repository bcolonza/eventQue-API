const jwt = require("jsonwebtoken");
const Sevak = require("../models/Sevak");

const getToken = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    return req.headers.authorization.split(" ")[1];
  }
  return null;
};

const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    const token = getToken(req);
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Sevak.findById(decoded.id).select("-password");

      if (!user || !allowedRoles.includes(user.role) || user.isDeleted) {
        return res
          .status(403)
          .json({ message: `Access denied. Role must be one of: ${allowedRoles.join(", ")}` });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
};
module.exports = authorizeRoles;


// const isAdmin = async (req, res, next) => {
//     let token;

//     if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
//         try {
//             token = req.headers.authorization.split(' ')[1];
//             const decoded = jwt.verify(token, process.env.JWT_SECRET);

//             req.user = await User.findOne({_id:decoded.id}).select('-password');
//             next();
//         } catch (error) {
//             res.status(401).json({ message: 'Not authorized, token failed' });
//         }
//     }

//     if (!token) {
//         res.status(401).json({ message: 'Not authorized, no token added' });
//     }
// };

// const isAdmin = async (req, res, next) => {
//     const authHeader = req.headers.authorization;

//     if (authHeader && authHeader.startsWith('Bearer ')) {
//         const token = authHeader.split(' ')[1];
//         try {
//             const decrypted = verifyEncryptedToken(token);
//             const user = await User.findById(decrypted.id).select('-password');

//             if (!user || user.role !== 'admin') {
//                 return res.status(403).json({ message: 'Access denied: Admins only' });
//             }

//             req.user = user;
//             next();
//         } catch (err) {
//             return res.status(401).json({ message: 'Invalid or expired token' });
//         }
//     } else {
//         return res.status(401).json({ message: 'Authorization token missing' });
//     }
// };

// module.exports = { isAdmin };
