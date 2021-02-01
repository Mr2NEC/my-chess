const app = require('express')();
const server = require('http').createServer(app);
const { tokenValidate } = require('./authValidate');
const { addUser } = require('./sequelize/action/addUser');
const loginUser = require('./sequelize/action/loginUser');
const jsChess = require('js-chess-engine')

const { PORT } = require('./defaults.json');
const User = require('./sequelize/schema/userSchema');
let usersArr = [];

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', async (client) => {
    let user = await tokenValidate(client);
    let game = null;
    let rg = null;

    if (user) {
        usersArr.push({
            login: user.login,
            id: user.id,
            connectionId: client.id,
            
        });
        client.broadcast.emit('USERONLINEADD', [{
            login: user.login,
            id: user.id,
            connectionId: client.id,
            
        }])
    } else {
        usersArr.push({ login: 'anon', id: -1, connectionId: client.id });
    }

    let authUsersArr = usersArr.filter(item=>item.id !== -1 && item.connectionId !== client.id)

    client.emit('USERONLINE', authUsersArr);

    try {
        client.on('disconnect', () => {
            usersArr = usersArr.filter((user) => user.connectionId !== client.id);
            client.broadcast.emit('USERONLINEDEL', client.id)
        });

        client.on('REGISTER', async (data, callback) => {
            await addUser(data.login, data.password);
            callback({
                status: 200,
            });
        });

        client.on('LOGIN', async (data) => {
            const loggedUser = await loginUser(data.login, data.password);
            user = loggedUser.user;
            client.emit('LOGIN', loggedUser.token);
            usersArr.map((item) => {
                if (item.connectionId === client.id) {
                    item.id = user.id;
                    item.login = user.login;
                    client.broadcast.emit('USERONLINEADD', [item])
                } 
            });
        });

        client.on('LOGOUT', () => {
            user = null;
            usersArr.map((item) => {
                if (item.connectionId === client.id) {
                    item.login = 'anon';
                    item.id = -1;
                    client.broadcast.emit('USERONLINEDEL', client.id)
                }
            });
        });

        client.on("PROPOSEPLAY", (anotherSocketId) => {
            client.to(anotherSocketId).emit("PROPOSEPLAY", {connectionId:client.id, login:user.login, show:true})
        });

        client.on("move", ({from, to}) => {
            try {
                rg.move(from, to);
                const gameState = rg.exportJson()
                console.log(gameState)
            }catch (e){
                console.log(e)
            }
        });

        client.on("JOINROOM", (room) => {
            client.join(room)
            console.log(client.id)
        });

        client.on("GAMEDBINIT", async(data) => {
            console.log(data);
            if(user && !game){
            if(data.status === true){
                const anotherUser = usersArr.find(item=>item.connectionId === data.anotherSocketId)
                game = await user.createGame({completed: false,winner:null,movements:'[]'})
                game.blackId  = Math.random() > 0.5 ? user.id : anotherUser.id
                game.whiteId = game.blackId === user.id ? user.id : anotherUser.id

                await game.save();
                rg = new jsChess.Game();
                const gameState = rg.exportJson()
                client.emit("PROPOSEPLAY", { show:false})
                client.emit("GAMEDBINIT", {gameId: game.id, color: game.blackId === user.id ? 'black' : 'white', status:true})
                client.to(data.anotherSocketId).emit("GAMEDBINIT", {gameId: game.id, color: game.blackId === user.id ? 'white' : 'black', status:true})
                client.emit("GAME", {...gameState});
                client.to(data.anotherSocketId).emit("GAME", {...gameState});
            }else{
                client.emit("PROPOSEPLAY", { show:false})
            //    client.to(data.anotherSocketId).emit("ERROR", 'User doesn't want to play')
            }
            }
        });
        client.on("SENDMSG", (msg) => {
            client.to(anotherSocketId).emit("PROPOSEPLAY", {connectionId:client.id, login:user.login, show:true})
        });

    } catch (e) {
        console.log(e.message);
        // client.emit('ERROR', e.message);
    }
});
 
server.listen(process.env.PORT || PORT);
