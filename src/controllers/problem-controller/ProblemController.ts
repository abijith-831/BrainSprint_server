import { Request , Response } from 'express'
import { ProblemService } from '../../services/user/problemService'

const problemService = new ProblemService()

class ProblemController {

    async getProblems(req:Request,res:Response){

        const response = await problemService.getProblems()

        if(!response.success){
            return res.status(400).json({success:false,message:response.message });
        }else{
            return res.status(200).json({success:true,message:response.message, data: response.data})
        }
        
    }

    async testProblem(req:Request,res:Response){
        const { code, language, title, description } = req.body;
        console.log('daa',description);
        
        const result = await problemService.testProblem({ code, language, title, description });
        return res.status(result.success ? 200 : 400).json(result);
    }
}

export default ProblemController