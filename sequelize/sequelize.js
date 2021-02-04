
const { Sequelize } = require('sequelize');
const {mysql} = require("../defaults.json");
const sequelize = new Sequelize(mysql);


sequelize.sync().then(_=>console.log('sequelize ok')).catch(e=>console.log(e.message))

module.exports = sequelize