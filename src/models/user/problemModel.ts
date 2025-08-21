import mongoose, { Schema, Document } from "mongoose";

export interface IProblem extends Document {
  _id: string;
  id: number;
  title: string;
  description: string;
  is_premium: number;
  difficulty: string;
  solution_link: string;
  acceptance_rate: number;
  frequency: number;
  url: string;
  discuss_count: number;
  accepted: string;
  submissions: string;
  companies: string;
  related_topics: string;
  likes: number;
  dislikes: number;
  rating: number;
  asked_by_faang: number;
  similar_questions: string;
}

const ProblemSchema: Schema = new Schema(
  {
    id: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    is_premium: { type: Number, default: 0 },
    difficulty: { type: String, required: true },
    solution_link: { type: String },
    acceptance_rate: { type: Number },
    frequency: { type: Number },
    url: { type: String },
    discuss_count: { type: Number },
    accepted: { type: String },
    submissions: { type: String },
    companies: { type: String },
    related_topics: { type: String },
    likes: { type: Number },
    dislikes: { type: Number },
    rating: { type: Number },
    asked_by_faang: { type: Number },
    similar_questions: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProblem>("Problems", ProblemSchema);
