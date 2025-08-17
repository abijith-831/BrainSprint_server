import bcrypt from "bcryptjs";
import { UserRepositories } from "../../repositories/implementation/UserRepository";
import { IUser } from "../../models/user/userModel";
import { generateAccessToken , generateRefreshToken } from "../../utils/token.util";

export class AuthService {
    private userRepositories: UserRepositories;
    constructor() {
        this.userRepositories = new UserRepositories();
    }

    async userSignup(username: string, email: string,password: string ): Promise<{
        success: boolean;
        message: string;
        data?: {
            userId: string;
            username: string;
            email: string;
            accessToken:string;
            refreshToken:string
        };
    }> {
        const existingUser = await this.userRepositories.findUserByEmail(email);

        if (existingUser) {
            return { success: false, message: "User already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const savedDetails = await this.userRepositories.createUser({
            username,
            email,
            password: hashedPassword,
        });

        if (!savedDetails) {
            return {
                success: false,
                message: "User registration failed. Please try again later.",
            };
        }

        const accessToken = generateAccessToken(savedDetails.id)
        const refreshToken = generateRefreshToken(savedDetails.id )

        console.log('access',accessToken);
        console.log('refresh',refreshToken);
        
        return {
            success: true,
            message: "User created successfully",
            data: {
                userId: savedDetails.id,
                username: savedDetails.username,
                email: savedDetails.email,
                accessToken,
                refreshToken
            },
        };
    }

    async userLogin( email: string,password: string ): Promise<{
        success: boolean;
        message: string;
        data?: {
            userId: string;
            username: string;
            email: string;
            accessToken:string;
            refreshToken:string
        };
    }> {
        const existingUser = await this.userRepositories.findUserByEmail(email);

        if (!existingUser) {
            return { success: false, message: "Invalid email or password" };
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return { success: false, message: "Invalid email or password" };
        }

        const accessToken = generateAccessToken(existingUser._id.toString());
        const refreshToken = generateRefreshToken(existingUser._id.toString());

        return {
            success: true,
            message: "Login successful",
            data: {
                userId: existingUser._id,
                username: existingUser.username,
                email: existingUser.email,
                accessToken,
                refreshToken
            },
        };
    }
}
