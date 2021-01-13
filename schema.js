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
module.exports = function () {
    return schema;
};
