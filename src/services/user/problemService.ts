import { IProblem } from "../../models/user/problemModel";
import { ProblemRepositories } from "../../repositories/implementation/ProblemRepository";
import axios from "axios";

interface TestProblemPayload {
    code: string;
    language: string;
    title: string;
    description: string;
}

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

    async testProblem(payload: TestProblemPayload): Promise<{
        success: boolean;
        message: string;
        output?: any;
      }> {
        try {
            
            const languageMap: Record<string, number> = {
              javascript: 63, // Node.js 12
              python: 71,     // Python 3
              java: 62,       // Java 17
              cpp: 54         // C++ (GCC 9.2)
            };
        
            const languageId = languageMap[payload.language.toLowerCase()];
            if (!languageId) {
              return { success: false, message: `Unsupported language: ${payload.language}` };
            }
        
            
            const response = await axios.post(
              "https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true",
              {
                source_code: payload.code,
                language_id: languageId,
                stdin: "" 
              },
              {
                headers: {
                  "Content-Type": "application/json",
                  "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
                  "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
                }
              }
            );
        
            
            const result = response.data;
            console.log('resss',result);
            
            const output = result.stdout || result.stderr || "No output";
        
            return {
              success: true,
              message: "Code tested successfully",
              output: result
            };
          } catch (error) {
            console.error(error);
            return { success: false, message: "Failed to test problem" };
          }
    }
}