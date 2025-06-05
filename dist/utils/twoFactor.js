"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verify2FAToken = exports.getQRCode = exports.generate2FASecret = void 0;
const speakeasy_1 = __importDefault(require("speakeasy"));
const qrcode_1 = __importDefault(require("qrcode"));
const generate2FASecret = (email) => {
    return speakeasy_1.default.generateSecret({ name: `GraphQLApp (${email})` });
};
exports.generate2FASecret = generate2FASecret;
const getQRCode = async (otpauth_url) => {
    return await qrcode_1.default.toDataURL(otpauth_url);
};
exports.getQRCode = getQRCode;
const verify2FAToken = (token, secret) => {
    return speakeasy_1.default.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 1,
    });
};
exports.verify2FAToken = verify2FAToken;
