require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models/db');
const errorHandler = require('./middleware/errorHandler');
const app = express();

// Middleware
app.use(cors())
app.use(helmet());
app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.use('/api/auth', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/import', require('./routes/import'));
app.use('/api/email', require('./routes/emailRoutes'));  // Add this line

// Error handling
app.use(errorHandler);

// Database connection and server start
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});