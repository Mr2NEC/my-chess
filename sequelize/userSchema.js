const { DataTypes } = require('sequelize');
const sequelize = require('./sequelize')
const Post = require('./postSchema')

const User = sequelize.define('User', {
    login: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, 
);

User.hasMany(Post);
Post.belongsTo(User);

module.exports = User