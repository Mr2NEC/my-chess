const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize')
const Post = require('./postSchema')
const Game = require('./gameSchema')

class User extends Model {}

User.init({
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'User'
});


User.hasMany(Post);
User.hasMany(Game);

Post.belongsTo(User);
Post.belongsTo(Game);

Game.hasMany(Post);
Game.belongsTo(User, {as: 'black'})
Game.belongsTo(User, {as: 'white'})

module.exports = User