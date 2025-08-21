import mongoose, { Document, Schema, Model } from "mongoose";


export interface ICommit {
    _id?: mongoose.Types.ObjectId;
    codeSnapshot: string;
    result: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded";
    createdAt?: Date;
}


export interface ISolution extends Document {
    userId: mongoose.Types.ObjectId;
    questionId: mongoose.Types.ObjectId;
    code: string;
    language: string;
    lastUpdated: Date;
    commits: ICommit[];
}

const commitSchema = new Schema<ICommit>(
    {
      codeSnapshot: { type: String, required: true },
      result: {
        type: String,
        enum: ["Accepted", "Wrong Answer", "Runtime Error", "Time Limit Exceeded"],
        required: true,
      },
      createdAt: { type: Date, default: Date.now },
    },
    { _id: true }
);
  

const solutionSchema = new Schema<ISolution>(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      questionId: { type: Schema.Types.ObjectId, ref: "Question", required: true },
      code: { type: String, default: "" },
      language: { type: String, default: "javascript" },
      lastUpdated: { type: Date, default: Date.now },
      commits: [commitSchema],
    },
    { timestamps: true }
);
  
const Solution: Model<ISolution> = mongoose.model<ISolution>("Solution", solutionSchema);
  
export default Solution;