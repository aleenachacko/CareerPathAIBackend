const sequelize = require("../config/db");
const { Sequelize, DataTypes } = require("sequelize");

const Resume = sequelize.define("Resume", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  resume_data: {
    type: Sequelize.JSON,
    allowNull: false,
  },
  createdAt: {
    field: "created_at",
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  updatedAt: {
    field: "updated_at",
    type: Sequelize.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Resume;
