const app = require('express')();
const server = require('http').createServer(app);
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
    let user = await tokenValidate(client);

    if (user) {
        usersArr.push({
            login: user.login,
            id: user.id,
            connectionId: client.id,
        });
    } else {
        usersArr.push({ login: 'anon', id: -1, connectionId: client.id });
    }

    client.on('disconnect', () => {
        usersArr = usersArr.filter((user) => user.connectionId !== client.id);
        console.log(usersArr);
    });

    try {
        client.on('REGISTER', async (data, callback) => {
            await addUser(data.login, data.password);
            callback({
                status: 200,
            });
        });

        client.on('LOGIN', async (data) => {
            const loggedUser = await loginUser(data.login, data.password);
            user = loggedUser.user;
            io.emit('LOGIN', loggedUser.token);
            usersArr.map((item) => {
                if (item.connectionId === client.id) {
                    item.id = user.id;
                    item.login = user.login;
                }
            });
        });

        client.on('LOGOUT', () => {
            user = null;
            usersArr.map((item) => {
                if (item.connectionId === client.id) {
                    item.login = 'anon';
                    item.id = -1;
                }
            });
        });
    } catch (e) {
        console.log(e.message);
        // client.emit('ERROR', e.message);
    }
});

server.listen(process.env.PORT || PORT);
