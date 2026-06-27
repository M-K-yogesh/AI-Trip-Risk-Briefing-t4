const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Generation = sequelize.define('Generation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    field: 'user_id',
    allowNull: true // Allow null for anonymous or general calls if needed, though we protect it.
  },
  adminName: {
    type: DataTypes.STRING,
    field: 'admin_name',
    allowNull: false
  },
  routeFrom: {
    type: DataTypes.STRING,
    field: 'route_from',
    allowNull: false
  },
  routeTo: {
    type: DataTypes.STRING,
    field: 'route_to',
    allowNull: false
  },
  season: {
    type: DataTypes.STRING,
    allowNull: false
  },
  vehicleType: {
    type: DataTypes.STRING,
    field: 'vehicle_type',
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  selectedModel: {
    type: DataTypes.STRING,
    field: 'selected_model',
    allowNull: false
  },
  aiResponse: {
    type: DataTypes.TEXT,
    field: 'ai_response',
    allowNull: false
  },
  responseTimeMs: {
    type: DataTypes.INTEGER,
    field: 'response_time_ms',
    allowNull: true
  }
}, {
  tableName: 'generations'
});

module.exports = Generation;
