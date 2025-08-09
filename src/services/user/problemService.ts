import { IProblem } from "../../models/user/problemModel";
import { ProblemRepositories } from "../../repositories/implementation/ProblemRepository";

export class ProblemService {

    private problemRepositories:ProblemRepositories

    constructor(){
        this.problemRepositories = new ProblemRepositories()
    }
    
    async getProblems():Promise<{
        success:boolean;
        message:string;
        data?:IProblem[]
    }>{
        try {
            const problems = await this.problemRepositories.getAllProblems()
            
            if (!problems || problems.length === 0) {
                return { success: false, message: "No problems found" };
            }
            
            return {
                success: true,
                message: "Problems fetched successfully",
                data: problems
            };

        } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to fetch problems" };
        }
    }
}