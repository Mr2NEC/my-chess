const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const bcrypt = require('bcrypt');
const authValidate = require('./authValidate')

const PORT = process.env.PORT || 4000;
const usersArr = []


const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', async (client) => { 
    usersArr.push({login: 'anon', id: -1, connectionId:client.id})
    console.log(usersArr);

    // client.on('message', async(data) =>{
    //     const user = await authValidate(client)
    //     switch (data.type) {
    //         case "users":
    //             client.send(users)
    //             break;
    //         case "signUp":
    //             const newUser = await User.create(login, passw)
    //             const getToken = generatorTokenow(user)
    //             addtodb()
    //             client.send(token)
    //             // usersArr.replace(user -> newUser by connId)
    //             break;
    //         case "signIn":
    //             const loggedUser = await User.get(login, passw)
    //             const getToken = generatorTokenow(user)
    //             client.send(token)
    //             // usersArr.replace(user -> loggedUser by connId)
    //             break;
            
    //         case 'sendMsg':
    //             if (user) {

    //             } else error
    //             break;
    //         case msg:
                
    //             break;
    //         case msg:
                
    //             break;
        
    //         default:
    //             break;
    //     }
    // })



 });


server.listen(PORT);
