
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('mysql://mychess@localhost/mychess');


sequelize.sync().then(_=>console.log('ok')).catch(e=>console.log(e))

module.exports = sequelize