import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "yourAccessSecret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "yourRefreshSecret";

export const generateAccessToken = (userId:string)=>{
    return jwt.sign({userId},ACCESS_TOKEN_SECRET , {expiresIn:'15m'})
}

export const generateRefreshToken = (userId:string)=>{
    return jwt.sign({userId},REFRESH_TOKEN_SECRET,{expiresIn:'7d'})
}

export const verifyAccessToken = (token:string)=>{
    try{
        return jwt.verify(token,ACCESS_TOKEN_SECRET) as { userId : string}
    }catch(err){
        return null
    }
}

export const verifyRefreshToken = (token:string)=>{
    try {
        return jwt.verify(token,REFRESH_TOKEN_SECRET) as {userId:string}
    } catch (error) {
        return null
    }
}

export const refreshAccessToken = (refreshToken: string) => {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) return null;
  
    const newAccessToken = generateAccessToken(decoded.userId);
    const newRefreshToken = generateRefreshToken(decoded.userId);
  
    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken, // optional (depends on your flow)
    };
};