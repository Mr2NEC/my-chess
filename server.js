const express = require('express');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const jwtSecret = 'b4pVmNkmbQGYkVuaakbKMDplko';
const bcrypt = require('bcrypt');

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mychess@localhost/mychess');

const server = app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
});

io.use(function (socket, next) {
    let user;
    if (
        socket.handshake.query &&
        socket.handshake.query.token &&
        socket.handshake.query.token.startsWith('Bearer ')
    ) {
        let token = socket.handshake.query.token.slice('Bearer '.length);
        try {
            let decoded = jwt.verify(token, jwtSecret);
            if (decoded) {
                User.findByPk(decoded.sub.id)
                    .then((user) => {
                        if (!user) throw new Error('User is not found');
                        return user.id;
                    })
                    .then((id) =>
                        User.update({ online: true }, { where: { id } })
                    )
                    .then(() => next());
            }
        } catch (e) {
            io.emit('error', { message: 'User is not found', error: e });
        }
    } else if (socket.handshake.query.token === {}) {
        return next((user = 'anon'));
    } else {
        next(new Error('Authentication error'));
    }
}).on('connection', function (socket) {
    socket.on('sendMSG', async ({ chatID, text }) => {
        console.log(chatID, text);
        await Post.create({ chatID, text });
        return socket.emit('sendMSG', 'ok');
    });
});

class User extends Model {
    get posts() {
        return this.getPosts();
    }
}
User.init(
    {
        login: DataTypes.STRING,
        password: DataTypes.STRING,
        online: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    { sequelize, modelName: 'user' }
);

class Post extends Model {
    get user() {
        return this.getUser();
    }
}
Post.init(
    {
        chatID: DataTypes.INTEGER,
        text: DataTypes.TEXT,
    },
    { sequelize, modelName: 'post' }
);

User.hasMany(Post);
Post.belongsTo(User);

async function sequelizeInit() {
    await sequelize.sync();
}
sequelizeInit();
const { graphqlHTTP: express_graphql } = require('express-graphql');
const schema = require('./schema.js');

var root = {
    async addUser({ user: { login, password } }) {
        let user = await User.findOne({ where: { login } });
        if (!user) {
            password = await bcrypt.hash(password, 10);

            return await User.create({ login, password });
        }
        throw new Error(`Name is taken`);
    },
    async getUsers(skip, { user }) {
        if (!user) throw new Error(`can't get userS when your anon`);
        return User.findAll({});
    },
    async getUser({ id }, { user }) {
        if (!user) throw new Error(`can't get user when your anon`);
        return User.findByPk(id);
    },

    // async addPost({post:{title,text}}, {user, models: {User, Post}}){
    //     if (!user) throw new Error(`can't post anon posts`)

    //     let newPost = await user.createPost({title, text})
    //     return newPost
    // },

    // async changePost({post:{title,text,postId}}, {user}){
    //     if (!user) throw new Error(`can't post anon posts`)
    //     let post = Post.findOne({where:{id: postId, userId: userId}})

    //     if (!post) throw new Error(`post not found`)

    //     let newPost = await user.createPost({title, text})
    //     return newPost
    // },

    async login({ login, password }) {
        if (login && password) {
            let user = await User.findOne({ where: { login } });
            if (user && (await bcrypt.compare(password, user.password))) {
                const { id } = user;
                return jwt.sign(
                    { sub: { id, login, roles: ['user'] } },
                    jwtSecret
                );
            }
            throw new Error(`Incorrect login or password`);
        }
    },
};

app.use(cors());
app.use(express.static('public'));
// Create an express server and a GraphQL endpoint
app.use(
    '/graphql',
    express_graphql(async (req, res) => {
        let auth = req.headers.authorization;
        let user, models;
        if (auth && auth.startsWith('Bearer ')) {
            let token = auth.slice('Bearer '.length);
            try {
                let decoded = jwt.verify(token, jwtSecret);
                if (decoded) {
                    user = await User.findByPk(decoded.sub.id);
                }
            } catch (e) {
                console.log('User is not found', e);
            }
        }
        return {
            schema: schema(),
            rootValue: root,
            graphiql: true,
            context: { user, models },
        };
    })
);
