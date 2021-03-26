const { jwt } = require('./gql');
const User = require('./sequelize/schema/userSchema');
const { jwtSecret } = require('./defaults.json');

async function userAuth(auth) {
    try {
        const token = auth.slice('Bearer '.length);
        const decoded = jwt.verify(token, jwtSecret);
        if (decoded) {
            const user = await User.findByPk(decoded.sub.id);
            return user;
        }
        return null;
    } catch (e) {
        return null;
    }
}

module.exports = userAuth;
