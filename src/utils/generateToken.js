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
// const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
// const ALGORITHM = 'aes-256-cbc';

// // Encrypt payload
// function encryptPayload(payload) {
//     const iv = crypto.randomBytes(16);
//     const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), iv);
//     let encrypted = cipher.update(JSON.stringify(payload));
//     encrypted = Buffer.concat([encrypted, cipher.final()]);
//     return iv.toString('hex') + ':' + encrypted.toString('hex');
// }

// // Decrypt payload
// function decryptPayload(encryptedData) {
//     const [ivHex, encryptedHex] = encryptedData.split(':');
//     const iv = Buffer.from(ivHex, 'hex');
//     const encryptedText = Buffer.from(encryptedHex, 'hex');
//     const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_SECRET), iv);
//     let decrypted = decipher.update(encryptedText);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);
//     return JSON.parse(decrypted.toString());
// }

// // Generate encrypted JWT
// function generateEncryptedToken(payload) {
//     const encrypted = encryptPayload(payload);
//     return jwt.sign({ data: encrypted }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
// }

// // Verify and decrypt JWT
// function verifyEncryptedToken(token) {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     const decryptedPayload = decryptPayload(decoded.data);
//     return decryptedPayload;
// }

// module.exports = {
//     generateEncryptedToken,
//     verifyEncryptedToken
// };
