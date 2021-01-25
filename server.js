const app = require('express')();
const server = require('http').createServer(app);
const cors = require('cors');
const { tokenValidate } = require('./authValidate');
const { addUser } = require('./sequelize/action/addUser');
const loginUser = require('./sequelize/action/loginUser');

const { PORT } = require('./defaults.json');
let usersArr = [];

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', async (client) => {
    let anon = { login: 'anon', id: -1, connectionId: client.id };
    usersArr.push(anon);
    console.log(usersArr);
    client.on('disconnect', () => {
        usersArr = usersArr.filter((user) => user.connectionId !== client.id);
    });

    client.on('message', async (data) => {
        const user = await tokenValidate(client);
        if (user.id !== -1) {
            const fUser = usersArr.find((u) => {
                u.connectionId === client.id;
            });
            if (fUser) {
                fUser = { ...fUser, ...user };
            }
        }
        try {
            switch (data.type) {
                case 'users':
                    client.send(users);
                    break;
                case 'REGISTER':
                    await addUser(data.login, data.password);
                    io.emit('message', {
                        type: data.type,
                        payload: 200,
                    });
                    break;
                case 'LOGIN':
                    const loggedUser = await loginUser(
                        data.login,
                        data.password
                    );
                    io.emit('message', {
                        type: data.type,
                        ...loginUser,
                    });
                    usersArr.map((user) => {
                        if (user.connectionId === client.id) {
                            user.id = loggedUser.id;
                            user.login = loggedUser.login;
                        }
                    });
                    break;
                case 'LOGOUT':
                    break;

                case 'SENDMSG':
                    if (user) {
                    } else error;
                    break;
                case msg:
                    break;

                default:
                    console.log(data.type);
                    break;
            }
        } catch (e) {
            client.emit('message', { type: data.type, message: e.message });
        }
    });
});

server.listen(process.env.PORT || PORT);
