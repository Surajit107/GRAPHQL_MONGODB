import { mergeTypeDefs } from '@graphql-tools/merge';
import { mergeResolvers } from '@graphql-tools/merge';
import userTypeDefs from './typeDefs/user.typeDef';
import userResolvers from './resolvers/user.resolver';

export const typeDefs = mergeTypeDefs([userTypeDefs]);
export const resolvers = mergeResolvers([userResolvers]); 