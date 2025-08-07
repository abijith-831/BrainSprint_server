import { Request, Response } from "express";
import { AuthService } from "../../services/user/authService";

const authService = new AuthService()

class AuthController{
    async signup(req:Request,res:Response){
        try {
            console.log('bakcedn controller');

            const { username , email , password} = req.body
            console.log('user',username);
            console.log('user',email);
            console.log('user',password);
            
            
            const response = await authService.userSignup(username,email,password)

            if(!response.success){
                return res.status(400).json({ error: 'Request failed' });
            }else{
                return res.status(200).json({success:true,message:"user registered successfully",user:response.data})
            }
            
        } catch (error) {
            
        }
    }
}

export default AuthController