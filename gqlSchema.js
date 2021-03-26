const { buildSchema } = require('graphql');

const schema = buildSchema(`
    type Query {
        getUsers: [User]
        getUser(id: ID!): User
        signInUser(username: String!, password: String!):String
    }

    type Mutation {
        signUpUser(user: UserInput): User
    }

    type User {
        id: ID,
        username: String,
        createdAt: String,
        updatedAt: String
    }

    input UserInput {
        username: String!,
        password: String!,
    }
`);

module.exports = schema;
