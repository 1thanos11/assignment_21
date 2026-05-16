"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const security_service_js_1 = require("../../common/services/security.service.js");
const user_enums_js_1 = require("../../common/enums/user.enums.js");
const userSchema = new mongoose_1.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: {
        type: String,
        required: function () {
            return this.provider === user_enums_js_1.ProviderEnum.SYSTEM;
        },
    },
    role: { type: Number, enum: user_enums_js_1.RoleEnum, default: user_enums_js_1.RoleEnum.USER },
    provider: {
        type: Number,
        enum: user_enums_js_1.ProviderEnum,
        default: user_enums_js_1.ProviderEnum.SYSTEM,
    },
    gender: { type: Number, enum: user_enums_js_1.GenderEnum, default: user_enums_js_1.GenderEnum.MALE },
    phone: String,
    profilePicture: String,
    coverPictures: [String],
    changeCredentialsTime: Date,
    confirmEmail: Date,
    DOB: Date,
    friends: [{ type: mongoose_1.Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    restoredAt: Date,
}, {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
const securityService = new security_service_js_1.SecurityService();
userSchema
    .virtual("username")
    .set(function (value) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName;
    this.lastName = lastName;
})
    .get(function () {
    return this.firstName + " " + this.lastName;
});
userSchema.pre("save", async function () {
    if (this.password && this.isModified("password")) {
        this.password = await securityService.generateHash({ data: this.password });
    }
    if (this.phone && this.isModified("phone")) {
        this.phone = await securityService.encrypt({ plaintext: this.phone });
    }
});
userSchema.pre(["findOne", "find", "countDocuments"], function () {
    const query = this.getQuery();
    if (query.paranoid === false) {
    }
    else {
        this.setQuery({ ...query, deletedAt: { $exists: false } });
    }
});
userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
    const update = this.getUpdate();
    if (update.deletedAt) {
        this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
    }
    if (update.restoredAt) {
        this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
        this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
    }
    const query = this.getQuery();
    if (query.paranoid === false) {
    }
    else {
        this.setQuery({ deletedAt: { $exists: false }, ...query });
    }
});
userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
    const query = this.getQuery();
    if (query.force === true) {
    }
    else {
        this.setQuery({ deletedAt: { $exists: true }, ...query });
    }
});
exports.User = mongoose_1.models.User || (0, mongoose_1.model)("User", userSchema);
