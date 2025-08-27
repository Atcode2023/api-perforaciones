"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paginate_1 = require("../paginate");
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'USER',
        enum: ['ADMIN', 'USER', 'SUPERVISOR'],
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    deleted_at: {
        type: Date,
        default: null,
    },
    last_sync: { type: Date, default: null },
});
userSchema.plugin(paginate_1.paginate);
userSchema.methods.softDelete = async function () {
    if (this.deleted_at)
        return this; // Ya eliminado
    await userModel.updateOne({ _id: this._id }, { $set: { deleted_at: new Date() } });
    this.deleted_at = new Date();
    return this;
};
const userModel = (0, mongoose_1.model)('User', userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map