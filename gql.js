const User = require('./sequelize/schema/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('./defaults.json');

const root = {
    async getUsers(skip, { user }) {
        return User.findAll({});
    },

    async getUser({ id }, { user }) {
        if (!user) throw new Error(`can't get user when your anon`);
        return User.findByPk(id);
    },

    async signUpUser(login, password) {
        let user = await User.findOne({ where: { login } });
        if (user) {
            throw new Error(`Name is taken`);
        }
        const newPassword = await bcrypt.hash(password, 10);
        return await User.create({ login, password: newPassword });
    },

    async signInUser(login, password) {
        if (login && password) {
            if (login && password) {
                let loggedUser = await User.findOne({ where: { login } });
                if (
                    loggedUser &&
                    (await bcrypt.compare(password, loggedUser.password))
                ) {
                    const { id } = loggedUser;
                    return {
                        loggedUser,
                        token: jwt.sign({ sub: { id, login } }, jwtSecret),
                    };
                }
                throw new Error(`Incorrect login or password`);
            }
        }
    },
};

module.exports = { root, jwt };
