import { UserRepositories } from "../../repositories/implementation/UserRepository";
import { IUser } from "../../models/user/userModel";


export class AuthService {
    private userRepositories: UserRepositories;
    constructor() {
        this.userRepositories = new UserRepositories();
    }

    async userSignup(username:string,email:string,password:string):Promise<{
        success:boolean;
        message:string;
        data?:{
            userId:string
            username:string
            email:string
        }
    }>{
        const existingUser = await this.userRepositories.findUserByEmail(email)

        if(existingUser){        
            return {success:false,message:"User already exists"}
        }

        const savedDetails = await this.userRepositories.createUser({
            username:username,
            email:email,
            password:password
        })

        if (!savedDetails) {
            return {
              success: false,
              message: "User registration failed. Please try again later.",
            };
        }

        return {
            success: true,
            message: "User created successfully",
            data: {
              userId: savedDetails.id,
              username: savedDetails.username,
              email: savedDetails.email,
            },
        };     
    }
}