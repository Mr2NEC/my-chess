const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const {tokenValidate} = require('./authValidate')
const {addUser} = require('./sequelize/action/addUser')
const loginUser = require('./sequelize/action/loginUser')

const {PORT} = require("./defaults.json");
const usersArr = []


const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});


io.on('connection', async (client) => { 
    let anon = {login: 'anon', id: -1, connectionId:client.id}
    let clientId = client.handshake.auth.connectionId
    console.log(clientId);
    console.log(client.id);

    if(clientId && clientId !== client.id && usersArr.length !== 0){
        usersArr.map(user => {
            if(user.connectionId === clientId){
                user.connectionId = client.id;
                io.emit('connection', {...user})
            }})
    }else{
        console.log('123');
        usersArr.push(anon);
        io.emit('connection', {...anon})
    }

    console.log(usersArr);
    client.on('!connectionId', (id)=>{let index = usersArr.findIndex((user) => user.connectionId === id); console.log(index,usersArr);})

    client.on('message', async(data) =>{
        const user = await tokenValidate(client)
        switch (data.type) {
            case "users":
                client.send(users)
                break;
            case "LOGIN":
                const newUser = await addUser(data.login, data.password)
                   if(!newUser.error){
                       io.emit(`{data.type}`, 200);
                       break;
                    }
                   io.emit(`{data.type}`, newUser.error)
                break;
            case "REGISTER":
                const loggedUser = await loginUser(data.login, data.password)
                if(!loggedUser.error){
                       io.emit(data.type, loggedUser);
                       usersArr.map(user => {
                    if(user.connectionId === client.id){
                        user.id = loggedUser.id;
                        user.login = loggedUser.login
                    }
            })
                       break;
                    }
                io.emit(data.type, loggedUser.error)
                break;
            case "LOGOUT":
                
                break;
            
            case 'SENDMSG':
                if (user) {

                } else error
                break;
            case msg:
                
                break;
        
            default:
                break;
        }
    })
 });


server.listen(process.env.PORT || PORT);
