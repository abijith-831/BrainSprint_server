import { Request, Response } from "express";
import { AuthService } from "../../services/user/authService";

const authService = new AuthService()

class AuthController{
    async signup(req:Request,res:Response){
        try {
            
            const { username , email , password} = req.body

            if (!username || !email || !password) {
                return res.status(400).json({
                  success: false,
                  message: "All fields are required",
                });
            }
            
            const response = await authService.userSignup(username,email,password)
            
            if(!response.success){
                return res.status(400).json({success:false,message:response.message });
            }else{
                return res.status(200).json({success:true,message:"user registered successfully",user:response.data})
            }
            
        } catch (error) {
            
        }
    }
}

export default AuthController