const User = require('../schema/userSchema')
const bcrypt = require('bcrypt');

const addUser = async(login, password)=>{
    try{
        let user = await User.findOne({ where: { login } });
        if (!user) {
            password = await bcrypt.hash(password, 10);

            return await User.create({ login, password });
        }
        throw new Error(`Name is taken`);
    }catch(e){
        return {error:e}
    }
}

module.exports = {addUser,bcrypt}