const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize')

class Game extends Model {}

Game.init({
    completed:DataTypes.BOOLEAN,
    winnerId:DataTypes.INTEGER,
    movements:DataTypes.TEXT,
}, {
    sequelize,
    modelName: 'Game'
});

module.exports = Game