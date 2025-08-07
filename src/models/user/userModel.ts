import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
    _id : string;
    username:string;
    email:string;
    password:string;
    image?:string;
}

const userSchema:Schema = new Schema(
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
            required:true
          },
          image: {
            type: String, 
            default: "",  
          }
    },
    {
        timestamps:true;
    }
)

export default mongoose.model<IUser>("User" ,userSchema)