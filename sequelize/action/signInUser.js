const { jwtSecret } = require('../../defaults.json');
const { bcrypt } = require('./signUpUser');
const { jwt } = require('../../authValidate');
const User = require('../schema/userSchema');

const signInUser = async (login, password) => {
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
};

module.exports = signInUser;
