"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvers = exports.typeDefs = void 0;
const merge_1 = require("@graphql-tools/merge");
const merge_2 = require("@graphql-tools/merge");
const user_typeDef_1 = __importDefault(require("./typeDefs/user.typeDef"));
const user_resolver_1 = __importDefault(require("./resolvers/user.resolver"));
exports.typeDefs = (0, merge_1.mergeTypeDefs)([user_typeDef_1.default]);
exports.resolvers = (0, merge_2.mergeResolvers)([user_resolver_1.default]);
