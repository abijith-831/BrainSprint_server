import Problems , {IProblem} from "../../models/user/problemModel";

export class ProblemRepositories {

    async getAllProblems(): Promise<IProblem[]> {
        return await Problems.find();
    }
    
}