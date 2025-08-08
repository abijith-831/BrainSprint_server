import User , { IUser } from '../../models/user/userModel'

export class UserRepositories {
    
    async createUser(data:any):Promise<IUser|null>{
        return await User.create(data)
    }

    async findUserByEmail(email:string):Promise<IUser|null>{
        const data = await User.findOne({email})
        const userData = data?.toObject()

        return userData as IUser
    }

}