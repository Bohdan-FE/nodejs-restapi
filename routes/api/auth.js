import express from 'express'
import authController from '../../controllers/auth-controller.js'
import { isEmptyBody } from '../../middlewares/index.js'
import { validateBody } from '../../decorators/index.js'
import { loginSchema, registerSchema } from '../../models/User.js'


const router = express.Router()

router.post('/register', isEmptyBody, validateBody(registerSchema), authController.register)

router.post('/login', isEmptyBody, validateBody(loginSchema), authController.login)

export default router