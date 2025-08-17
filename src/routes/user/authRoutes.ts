import express from 'express'
import AuthController from '../../controllers/user-controller/AuthController'
import { refreshAccessToken } from '../../utils/token.util'

const userAuth_route = express.Router()

const authController = new AuthController()

userAuth_route.post('/signup',authController.signup)
userAuth_route.post('/login',authController.login)
userAuth_route.post('/refresh', async (req, res) => {
    const { refreshToken } = req.body
  
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' })
    }
  
    const result = refreshAccessToken(refreshToken)
  
    if (!result) {
      return res.status(403).json({ message: 'Invalid or expired refresh token' })
    }
  
    return res.json(result)
})



export default userAuth_route