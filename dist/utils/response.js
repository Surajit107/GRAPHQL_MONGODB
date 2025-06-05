"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.error = exports.success = void 0;
const success = (message, data) => ({ success: true, message, data });
exports.success = success;
const error = (message) => { throw new Error(message); };
exports.error = error;
