const sequelize = require("../config/db");
const { Sequelize, DataTypes } = require("sequelize");

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
  createdAt: {
    field: 'created_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  },
  updatedAt: {
    field: 'updated_at',
    type: DataTypes.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'career_profiles'
});

module.exports = CareerProfile;