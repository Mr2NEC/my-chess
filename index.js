const app = require('express')();
const server = require('http').createServer(app);
const { graphqlHTTP: express_graphql } = require('express-graphql');
const { tokenValidate } = require('./authValidate');
const userAuth = require('./userAuth');
const gameInit = require('./gameInit');
const schema = require('./gqlSchema');
const root = require('./gql');
const { signUpUser } = require('./sequelize/action/signUpUser');
const signInUser = require('./sequelize/action/signInUser');
const Users = require('./users');
const { PORT } = require('./defaults.json');

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

const users = new Users();
let user;

app.use(
    '/graphql',
    express_graphql(async (req, res) => {
        let auth = req.headers.authorization;
        user = await userAuth(auth);
        return {
            schema,
            rootValue: root,
            graphiql: true,
            context: { user },
        };
    }),
);

io.on('connection', async (client) => {
    try {
        const connectionId = client.id;
        let user = await tokenValidate(client);

        let { userData, logout } = user
            ? users.addUser(connectionId, user)
            : users.addUser(connectionId);

        if (logout) {
            client.emit('LOGOUT');
        }

        if (userData.id !== -1) {
            client.broadcast.emit('USERONLINEADD', {
                ...userData,
                connectionId,
            });
        }

        const authUsers = users.getAuthUsers(connectionId);
        client.emit('USERONLINE', authUsers);

        client.on('LOGIN', async ({ login, password }) => {
            const { loggedUser, token } = await signInUser(login, password);

            const userInOnline = users.checkUserInOnline(loggedUser);
            if (userInOnline) throw new Error('The user is already online.');

            user = loggedUser;
            client.emit('LOGIN', token);

            const userOnline = users.updateUser(connectionId, user);
            client.broadcast.emit('USERONLINEADD', userOnline);
        });

        client.on('REGISTER', async ({ login, password }, callback) => {
            const done = await signUpUser(login, password);
            if (done) callback({ status: 200 });
        });

        client.on('LOGOUT', () => {
            user = null;
            users.updateUser(connectionId);
            client.broadcast.emit('USERONLINEDEL', connectionId);
        });

        client.on('PROPOSEPLAY', (anotherSocketId) => {
            try {
                if (!user) throw new Error('Please log in to create a game.');
                client.to(anotherSocketId).emit('PROPOSEPLAY', {
                    connectionId,
                    login: user.login,
                    show: true,
                });
            } catch (e) {
                client.emit('ERROR', e.message);
            }
        });

        client.on('disconnect', () => {
            users.deleteUser(connectionId);
            client.broadcast.emit('USERONLINEDEL', connectionId);
        });
    } catch (e) {
        client.emit('ERROR', e.message);
    }
});

server.listen(process.env.PORT || PORT);
