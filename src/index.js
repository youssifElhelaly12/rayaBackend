require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { sequelize } = require('./models/db');
const errorHandler = require('./middleware/errorHandler');
const eventEmailTemplateRoutes = require('./routes/eventEmailTemplateRoutes');
const verifiedEmailTemplateRoutes = require('./routes/verifiedEmailTemplateRoutes');
const questionRoutes = require('./routes/questionRoutes');
const userAnswerRoutes = require('./routes/userAnswerRoutes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const fs = require('fs');

const app = express();

// Middleware
app.use(cors());

// ✅ Configure Helmet CSP
app.use(
    helmet({
        crossOriginResourcePolicy: { policy: "cross-origin" }, // 👈 allow frontend to load images
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                baseUri: ["'self'"],
                fontSrc: ["'self'", "https:", "data:"],
                formAction: ["'self'"],
                frameAncestors: ["'self'"],
                objectSrc: ["'none'"],
                scriptSrc: ["'self'"],
                scriptSrcAttr: ["'none'"],
                styleSrc: ["'self'", "https:", "'unsafe-inline'"],
                imgSrc: [
                    "'self'",
                    "data:",
                    "http://localhost:5173",          // dev frontend
                    "http://localhost:3000",          // backend uploads
                    "https://rayabackend.onrender.com", // production backend
                    "https://your-frontend-domain.com" // production frontend (Netlify/Vercel etc.)
                ],
            },
        },
    })
);
  

app.use(morgan());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads
app.use('/uploads', express.static('uploads'));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Routes
app.use('/api/auth', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));
app.use('/api/import', require('./routes/import'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/tags', require('./routes/tagRoutes'));
app.use('/api/eventEmailTemplates', eventEmailTemplateRoutes);
app.use('/api/verifiedEmailTemplates', verifiedEmailTemplateRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/user-answers', userAnswerRoutes);
app.use('/api/events', require('./routes/eventRoutes'));

app.get('/', (req, res) => {
    res.send('Server is running');
});

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error handling middleware
app.use(errorHandler);

// DB + server start
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch(err => {
    console.error('Unable to connect to the database:', err);
});
