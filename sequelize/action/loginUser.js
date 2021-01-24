const {jwtSecret} = require("../../defaults.json");
const {bcrypt} = require("./addUser");
const {jwt} = require("../../authValidate");

const loginUser = async( login, password )=>{
    if (login && password) {
        const newPassword = await bcrypt.hash(password, 10);
        let user = await User.findOne({ where: { login, password:newPassword } });
        if(!user) throw new Error(`Incorrect login or password`);
        return {
            id:user.id,
            login:user.login,
            token:jwt.sign({ sub: { id:user.id, login:user.login} },jwtSecret)
        };
    }


}

module.exports = loginUser