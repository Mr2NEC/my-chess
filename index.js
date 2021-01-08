const express = require('express');
const app = express();
const port = 4000;
const jwt = require('jsonwebtoken');
const jwtSecret = 'ДЖСОНСЕКРЕТОЯЕБУ';

const bcrypt = require('bcrypt');

const { Sequelize, Model, DataTypes } = require('sequelize');
const sequelize = new Sequelize('mysql://mychess@localhost/mychess');

class User extends Model {
    get posts() {
        return this.getPosts();
    }
}
User.init(
    {
        login: DataTypes.STRING,
        password: DataTypes.STRING,
    },
    { sequelize, modelName: 'user' }
);

(async () => {
    await sequelize.sync();
})();

const { graphqlHTTP: express_graphql } = require('express-graphql');
const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type Query {
        getUsers: [User]
        getUser(id: ID!): User
        login(login: String!, password: String!):String
    }

    type Mutation {
        addUser(user: UserInput): User
    }

    type User {
        id: ID,
        login: String,
        createdAt: String,
        updatedAt: String
    }

    input UserInput {
        login: String!,
        password: String!,
    }

`);

var root = {
    //объект соответствия названий в type Query и type Mutation с функциями-резолверами из JS-кода
    async getUsers(skip, { user }) {
        if (!user) throw new Error(`can't get userS when your anon`);
        return User.findAll({});
    },
    async getUser({ id }, { user }) {
        if (!user) throw new Error(`can't get user when your anon`);
        return User.findByPk(id);
    },
    async addUser({ user: { login, password } }) {
        password = await bcrypt.hash(password, 10);

        return await User.create({ login, password });
    },

    async login({ login, password }) {
        if (login && password) {
            let user = await User.findOne({ where: { login } });
            if (user && (await bcrypt.compare(password, user.password))) {
                const { id } = user;
                return jwt.sign({ sub: { id, roles: ['user'] } }, jwtSecret);
            }
        }
    },
};

// Create an express server and a GraphQL endpoint
app.use(
    '/graphql',
    express_graphql(async (req, res) => {
        let auth = req.headers.authorization;
        let user, models;
        if (auth && auth.startsWith('Bearer ')) {
            let token = auth.slice('Bearer '.length);
            //console.log('TOKEN FROM REQUEST', token)
            try {
                let decoded = jwt.verify(token, jwtSecret);
                if (decoded) {
                    user = await User.findByPk(decoded.sub.id);
                    //console.log('НЕ НАЕБАЛ', user)
                }
            } catch (e) {
                console.log('НАЕБАЛ', e);
            }
        }
        return {
            schema,
            rootValue: root,
            graphiql: true,
            context: { user, models },
        };
    })
);

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});
