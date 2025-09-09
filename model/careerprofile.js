const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/db'); // or your sequelize instance

const CareerProfile = sequelize.define("CareerProfile", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users', // Make sure this matches your actual table name
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  interests: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'career_profiles',
  timestamps: false, // Disable automatic timestamp fields
  underscored: true // Use snake_case for field names
});

module.exports = CareerProfile;