const User = require('../schema/userSchema')
const bcrypt = require('bcrypt');

const addUser = async(login, password)=>{

        let user = await User.findOne({ where: { login } });
        if (user) {
            throw new Error(`Name is taken`);
        }
        const newPassword = await bcrypt.hash(password, 10);
        return await User.create({ login, password:newPassword });
}

module.exports = {addUser,bcrypt}