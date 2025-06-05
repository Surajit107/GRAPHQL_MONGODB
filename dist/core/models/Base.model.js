"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseStaticMethods = exports.baseSchema = void 0;
const mongoose_1 = require("mongoose");
exports.baseSchema = new mongoose_1.Schema({
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true
});
// Common static methods
exports.baseStaticMethods = {
    findActive() {
        return this.find({ isActive: true });
    },
    async softDelete(id) {
        return this.findByIdAndUpdate(id, { isActive: false }, { new: true });
    }
};
