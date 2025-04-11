const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const cors = require('cors');

const sevakRoutes = require('./routes/sevakRoutes');
const eventRoutes = require('./routes/eventRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const mandalRoute = require('./routes/mandalRoute');
const masterEventRoute = require('./routes/masterEventRoute');

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
app.use('/api', sevakRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/department', departmentRoutes);
app.use('/api/mandal', mandalRoute);
app.use('/api/masterEvent', masterEventRoute);

app.use((req, res) => {
    res.status(404).json({ message: 'API endpoint not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
