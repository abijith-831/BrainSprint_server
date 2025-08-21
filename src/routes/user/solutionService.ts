import mongoose from "mongoose";
import Solution from "../../models/user/SolutionModel";
import User from "../../models/user/userModel";

interface SaveSolutionPayload {
  userId?: string;
  questionId: string; 
  code: string;
  language: string;
  result: "Accepted" | "Wrong Answer" | "Runtime Error" | "Time Limit Exceeded";
}

export const SolutionService = {
  async saveSolution(payload: SaveSolutionPayload) {
    if (!payload.userId) throw new Error("User ID is required");

    const questionId = new mongoose.Types.ObjectId(payload.questionId);
    const userId = new mongoose.Types.ObjectId(payload.userId);

    console.log("userId:", userId);
    console.log("questionId:", questionId);
    console.log("code:", payload.code);
    console.log("language:", payload.language);
    console.log("result:", payload.result);

    let solution = await Solution.findOne({ userId, questionId });
    
    if (!solution) {

      solution = new Solution({
        userId,
        questionId,
        code: payload.code,
        language: payload.language,
        commits: [
          {
            codeSnapshot: payload.code,
            result: payload.result,
          },
        ],
      });

      await solution.save();

    } else {
      solution.code = payload.code;
      solution.language = payload.language;
      solution.lastUpdated = new Date();
      solution.commits.push({
        codeSnapshot: payload.code,
        result: payload.result,
      });

      await solution.save();
    }
    await User.findByIdAndUpdate(userId, {
        $addToSet: { solutions: solution._id },
    });

    return solution;
  },
};
