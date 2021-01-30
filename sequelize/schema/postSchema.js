const { Model, DataTypes } = require('sequelize');
const sequelize = require('../sequelize')

class Post extends Model {}

Post.init({
    text: {
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'Post'
});


module.exports = Post