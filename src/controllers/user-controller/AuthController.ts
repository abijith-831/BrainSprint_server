import { Request, Response } from "express";
import { AuthService } from "../../services/user/authService";

const authService = new AuthService()

class AuthController{
    async signup(req:Request,res:Response){
        try {
            console.log('bakcedn controller');
            
        } catch (error) {
            
        }
    }
}

export default AuthController