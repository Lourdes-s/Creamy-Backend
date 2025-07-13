import express from 'express'
import { forgotPasswordController, loginController, recoveryPasswordController, registerController, verifyEmailController, contactMailController } from '../controllers/auth.controller.js'
import { verifyEmail } from '../helpers/validations.helpers.js'


const authRouter = express.Router()

authRouter.post('/register', registerController)
authRouter.post('/login', loginController)
authRouter.get('/verify-email/:validation_token', verifyEmailController)
authRouter.post('/forgot-password', forgotPasswordController)
authRouter.put('/recovery-password/:reset_token', recoveryPasswordController)
authRouter.post('/contact', contactMailController)

export default authRouter