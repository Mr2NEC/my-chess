const {  DataTypes } = require('sequelize');
const sequelize = require('./sequelize')

const Post = sequelize.define('Post', {
    chatID: {
        type: DataTypes.INTEGER,
      allowNull: false
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, 
);



module.exports = Post