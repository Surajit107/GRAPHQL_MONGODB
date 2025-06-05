"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = require("graphql-tag");
const userTypeDefs = (0, graphql_tag_1.gql) `
  type User {
    id: ID!
    email: String!
    username: String!
    isTwoFactorEnabled: Boolean!
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(email: String!, password: String!, username: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    enable2FA: String!
    verify2FA(token: String!): Boolean!
    disable2FA(token: String!): Boolean!
  }
`;
exports.default = userTypeDefs;
