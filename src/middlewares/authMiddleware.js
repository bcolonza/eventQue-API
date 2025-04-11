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

// const Sevak = require("../models/Sevak");
// const { verifyToken } = require("../utils");

// const getToken = (req) => {
//   if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
//     return req.headers.authorization.split(" ")[1];
//   }
//   return null;
// };

// const authorizeRoles = (...allowedRoles) => {
//   return async (req, res, next) => {
//     const token = getToken(req);
//     if (!token) {
//       return res.status(401).json({ message: "No token provided" });
//     }

//     try {
//       const decrypted = verifyToken(token);
//       const user = await Sevak.findById(decrypted.id).select("-password");

//       if (!user || !allowedRoles.includes(user.role) || user.isDeleted) {
//         return res.status(403).json({
//           message: `Access denied. Role must be one of: ${allowedRoles.join(", ")}`,
//         });
//       }

//       req.user = user;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: "Invalid or expired token" });
//     }
//   };
// };

// module.exports = authorizeRoles;
