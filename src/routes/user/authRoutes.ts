import express from 'express'
import AuthController from '../../controllers/user-controller/AuthController'

const userAuth_route = express.Router()

const authController = new AuthController()

userAuth_route.post('/signup',authController.signup)
userAuth_route.post('/login',authController.login)


export default userAuth_route