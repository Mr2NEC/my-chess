
const { Sequelize } = require('sequelize');
const {mysql} = require("../defaults.json");
const sequelize = new Sequelize(mysql);


sequelize.sync().then(_=>console.log('ok')).catch(e=>console.log(e))

module.exports = sequelize