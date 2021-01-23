const jwt = require('jsonwebtoken');
const User = require('./sequelize/userSchema');
const jwtSecret = 'b4pVmNkmbQGYkVuaakbKMDplko';

async function  authValidate(socket){
        try {
            const token = socket.handshake.query.token.slice('Bearer '.length);
            const decoded = jwt.verify(token, jwtSecret);
            if (decoded) {
            const user= await User.findByPk(decoded.sub.id)
            if (!user) return {login: 'anon', id: -1};
            return {login: user.login, id: user.id};      
            }
        } catch (e) {
            return {login: 'anon', id: -1};
        }

}

module.exports = authValidate