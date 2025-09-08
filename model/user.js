const sequelize = require("../config/db");

const {Sequelize, DataTypes} = require('sequelize');
const User = sequelize.define('User', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
 createdAt: {
  field: 'created_at',
  type: Sequelize.DATE
},
updatedAt: {
  field: 'updated_at',
  type: Sequelize.DATE
}
});

module.exports = User;