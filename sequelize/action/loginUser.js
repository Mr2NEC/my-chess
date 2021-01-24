const {jwtSecret} = require("../../defaults.json");
const {bcrypt} = require("./addUser");
const {jwt} = require("../../authValidate");

const loginUser = async( login, password )=>{
    try{
    if (login && password) {
        let user = await User.findOne({ where: { login } });
        if (user && (await bcrypt.compare(password, user.password))) {
            const { id } = user;
            return {
                id:id,
                login:login,
                token:jwt.sign({ sub: { id, login} },jwtSecret)
            };
        }
        throw new Error(`Incorrect login or password`);
    }}
    catch(e){
        return {error: e}
    }

}

module.exports = loginUser