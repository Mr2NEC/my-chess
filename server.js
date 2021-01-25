const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const {tokenValidate} = require('./authValidate')
const {addUser} = require('./sequelize/action/addUser')
const loginUser = require('./sequelize/action/loginUser')

const {PORT} = require("./defaults.json");
let usersArr = []


const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});


io.on('connection', async (client) => { 
    let anon = {login: 'anon', id: -1, connectionId:client.id}
    usersArr.push(anon);
    console.log(usersArr);
    client.on('disconnect', ()=>{
        usersArr = usersArr.filter((user)=>user.connectionId !== client.id );   
    })

    client.on('REGISTER',data, async( fn) => {
            await addUser(data.login, data.password);
            fn(200);
           });

    client.on('message', async(data) =>{
        const user = await tokenValidate(client)
        if(user.id !== -1){
            const fUser =  usersArr.find((u)=>{
                u.connectionId === client.id;
            })
            if(fUser){
                fUser = {...fUser, ...user}
            }
        }
        try{
            switch (data.type) {
                case "users":
                    client.send(users)
                    break;
                case "LOGIN":
                    const loggedUser = await loginUser(data.login, data.password)
                        io.emit(data.type, loggedUser);
                        usersArr.map(user => {
                        if(user.connectionId === client.id){
                            user.id = loggedUser.id;
                            user.login = loggedUser.login
                        }})
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
                    console.log(data.type);
                    break;
            }
        }catch(e){
            client.emit(data.type, e.message)
        }
    })
 });


server.listen(process.env.PORT || PORT);
