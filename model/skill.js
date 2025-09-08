const sequelize = require("../config/db");
const { Sequelize, DataTypes } = require("sequelize");

const Skill = sequelize.define("Skill", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  current_skills: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  desired_skills: {
    type: Sequelize.TEXT,
    allowNull: false,
  },
  analysis_result: {
    type: Sequelize.TEXT,
    allowNull: true,
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

module.exports = Skill;
