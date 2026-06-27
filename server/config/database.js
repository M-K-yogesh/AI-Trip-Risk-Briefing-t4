const { Sequelize } = require('sequelize');
require('dotenv').config();

// Support both a full DATABASE_URL (Render PostgreSQL) or individual env vars
const connectionString = process.env.DATABASE_URL;

let sequelize;

if (connectionString) {
  sequelize = new Sequelize(connectionString, {
    dialect: 'postgres',
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.PG_DATABASE || 'trip_risk_db',
    process.env.PG_USER || 'postgres',
    process.env.PG_PASSWORD || '',
    {
      host: process.env.PG_HOST || '127.0.0.1',
      port: parseInt(process.env.PG_PORT || '5432', 10),
      dialect: 'postgres',
      logging: false,
      define: {
        timestamps: true,
        underscored: true,
      },
      dialectOptions: {
        ssl: process.env.PG_SSL === 'true' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      }
    }
  );
}

module.exports = sequelize;
