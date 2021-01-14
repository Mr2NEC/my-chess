const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;
const jwt = require('jsonwebtoken');
const jwtSecret = 'b4pVmNkmbQGYkVuaakbKMDplko';
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
const schema = require('./schema.js');

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
                return jwt.sign(
                    { sub: { id, login, roles: ['user'] } },
                    jwtSecret
                );
            }
        }
    },
};

app.use(cors());
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
            schema: schema(),
            rootValue: root,
            graphiql: true,
            context: { user, models },
        };
    })
);

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
