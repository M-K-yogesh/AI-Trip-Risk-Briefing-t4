const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { sequelize, Template } = require('./models');

// Routes
const authRoutes = require('./routes/auth');
const aiRoutes = require('./routes/ai');
const historyRoutes = require('./routes/history');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');
const templateRoutes = require('./routes/templates');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api', aiRoutes); // Contains /api/generate
app.use('/api/history', historyRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/templates', templateRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Manivtha Outstation Safety Briefing Server is running.' });
});

// Seed default templates if database is empty
const defaultTemplates = [
  { templateName: 'Hyderabad ➔ Bangalore Express', routeFrom: 'Hyderabad', routeTo: 'Bangalore', season: 'Monsoon', vehicleType: 'Volvo AC Sleeper' },
  { templateName: 'Hyderabad ➔ Chennai Coastal Highway', routeFrom: 'Hyderabad', routeTo: 'Chennai', season: 'Summer', vehicleType: 'Innova Crysta SUV' },
  { templateName: 'Hyderabad ➔ Goa Ghat Route', routeFrom: 'Hyderabad', routeTo: 'Goa', season: 'Winter', vehicleType: 'Force Traveler' },
  { templateName: 'Hyderabad ➔ Mumbai Commercial Corridor', routeFrom: 'Hyderabad', routeTo: 'Mumbai', season: 'Monsoon', vehicleType: 'BharatBenz Sleeper Coach' }
];

async function startServer() {
  try {
    // Authenticate and sync Sequelize models
    console.log('Connecting to PostgreSQL Database...');
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Sync tables (creates/alters tables to match models)
    await sequelize.sync({ alter: true });
    console.log('Database tables successfully synchronized.');

    // Seed default template presets if empty
    const templateCount = await Template.count();
    if (templateCount === 0) {
      await Template.bulkCreate(defaultTemplates);
      console.log('Preloaded default trip templates successfully.');
    }

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  SERVER IS RUNNING ON PORT ${PORT}`);
      console.log(`  API Base URL: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });

  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
    console.log('Running fallback: The server requires a running PostgreSQL database.');
    console.log('Please verify your DATABASE_URL or PG_* settings.');

    // Start server anyway so health check endpoint is reachable
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} (Database offline mode)`);
    });
  }
}

startServer();
