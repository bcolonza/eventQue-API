const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const sevakRoutes = require('./routes/sevakRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
// app.use(cors({
    //   origin: 'http://your-frontend-domain.com',
    //   methods: ['GET', 'POST', 'PUT', 'DELETE'],
    //   credentials: true
    // }));
    
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/sevak', sevakRoutes);

app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
