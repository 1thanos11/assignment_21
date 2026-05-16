import { HydratedDocument, model, models, Schema, Types } from "mongoose";
import { SecurityService } from "../../common/services/security.service.js";
import { IUser } from "../../common/interfaces/user.interface.js";
import { GenderEnum, ProviderEnum, RoleEnum } from "../../common/enums/user.enums.js";

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: {
      type: String,
      required: function (this) {
        return this.provider === ProviderEnum.SYSTEM;
      },
    },
    role: { type: Number, enum: RoleEnum, default: RoleEnum.USER },
    provider: {
      type: Number,
      enum: ProviderEnum,
      default: ProviderEnum.SYSTEM,
    },
    gender: { type: Number, enum: GenderEnum, default: GenderEnum.MALE },
    phone: String,
    profilePicture: String,
    coverPictures: [String],
    changeCredentialsTime: Date,
    confirmEmail: Date,
    DOB: Date,
    friends: [{ type: Types.ObjectId, ref: "User" }],
    deletedAt: Date,
    restoredAt: Date,
  },
  {
    timestamps: true,
    strict: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
const securityService = new SecurityService();
//virtual
userSchema
  .virtual("username")
  .set(function (value: string) {
    const [firstName, lastName] = value.split(" ");
    this.firstName = firstName as string;
    this.lastName = lastName as string;
  })
  .get(function () {
    return this.firstName + " " + this.lastName;
  });

//hash password
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
  } else {
    this.setQuery({ ...query, deletedAt: { $exists: false } });
  }
});

userSchema.pre(["updateOne", "findOneAndUpdate"], function () {
  const update = this.getUpdate() as HydratedDocument<IUser>;
  if (update.deletedAt) {
    this.setUpdate({ ...update, $unset: { restoredAt: 1 } });
  }
  if (update.restoredAt) {
    this.setUpdate({ ...update, $unset: { deletedAt: 1 } });
    this.setQuery({ ...this.getQuery(), deletedAt: { $exists: true } });
  }
  const query = this.getQuery();
  if (query.paranoid === false) {
  } else {
    this.setQuery({ deletedAt: { $exists: false }, ...query });
  }
});

userSchema.pre(["deleteOne", "findOneAndDelete"], function () {
  const query = this.getQuery();
  if (query.force === true) {
  } else {
    this.setQuery({ deletedAt: { $exists: true }, ...query });
  }
});

//export model
export const User = models.User || model<IUser>("User", userSchema);
