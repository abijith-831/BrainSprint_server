import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    _id : string;
    username:string;
    email:string;
    password:string;
    image?:string;
    profile?: {
      realName?: string;
      avatarUrl?: string;
      country?: string;
      badges?: string[];
      social?: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        github?: string;
      };
      studies?: {
        school?: string;
        degree?: string;
        fieldOfStudy?: string;
        startYear?: number;
        endYear?: number;
      }[];
    };
}
 
const userSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: "",
    },
    profile: {
      realName: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      country: { type: String, default: "" },
      badges: [{ type: String }],

      social: {
        facebook: { type: String, default: "" },
        twitter: { type: String, default: "" },
        instagram: { type: String, default: "" },
        linkedin: { type: String, default: "" },
        github: { type: String, default: "" },
      },

      studies: [
        {
          school: { type: String, default: "" },
          degree: { type: String, default: "" },
          fieldOfStudy: { type: String, default: "" },
          startYear: { type: Number },
          endYear: { type: Number },
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);



export default mongoose.model<IUser>("User" ,userSchema)