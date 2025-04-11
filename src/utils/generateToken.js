const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign(
        { id: user._id, userName: user.userName,role:user.role },
        process.env.JWT_SECRET,
        { expiresIn: '90d' }
    );
};

module.exports = generateToken;

// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

// const JWT_SECRET = process.env.JWT_SECRET;
// const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET; // must be 32 chars
// const ALGORITHM = 'aes-256-cbc';

// const encrypt = (data) => {
//   const iv = crypto.randomBytes(16);
//   const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), iv);
//   let encrypted = cipher.update(JSON.stringify(data));
//   encrypted = Buffer.concat([encrypted, cipher.final()]);
//   return iv.toString('hex') + ':' + encrypted.toString('hex');
// };

// const decrypt = (encryptedString) => {
//   const [ivHex, encryptedHex] = encryptedString.split(':');
//   const iv = Buffer.from(ivHex, 'hex');
//   const encryptedText = Buffer.from(encryptedHex, 'hex');
//   const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return JSON.parse(decrypted.toString());
// };

// const generateToken = (user) => {
//   const encryptedPayload = encrypt({
//     id: user._id,
//     userName: user.userName,
//     role: user.role
//   });

//   return jwt.sign({ data: encryptedPayload }, JWT_SECRET, { expiresIn: '90d' });
// };

// const verifyToken = (token) => {
//   const decoded = jwt.verify(token, JWT_SECRET);
//   return decrypt(decoded.data);
// };

// module.exports = {
//   generateToken,
//   verifyToken,
// };

