import { gql } from 'graphql-tag';

const userTypeDefs = gql`
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

  type TwoFactorSecretPayload {
    secret: String!
    qrCode: String!
  }

  input RegisterInput {
    email: String!
    username: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    register(input: RegisterInput!): User!
    login(input: LoginInput!): AuthPayload!
    generate2FASecret: TwoFactorSecretPayload!
    verify2FA(token: String!): Boolean!
    disable2FA(token: String!): Boolean!
  }
`;

export default userTypeDefs; 