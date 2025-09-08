const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('career_nav_ai_db', 'root', 'Dbpassword@23', {
  host: 'localhost',
  dialect: 'mysql',
  logging: console.log
});

sequelize.authenticate()
  .then(() => console.log('✅ Connection established successfully.'))
  .catch(err => console.error('❌ Unable to connect:', err));


module.exports = sequelize;

