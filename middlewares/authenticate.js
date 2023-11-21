import jwt from "jsonwebtoken"
import User from '../models/User.js'
import { HttpError } from "../helpers/index.js"


const authenticate = async (req, res, next) => {
    const { authorization = '' } = req.headers  
    const [bearer, token] = authorization.split(' ')
    if (bearer !== 'Bearer') {
        next(HttpError(401, 'not bearer'))
    }
    try {
        const { id } = jwt.verify(token, process.env.SECRET_KEY) 
        const user = await User.findById(id)
        if (!user || !user.token || user.token !== token) {
          next(HttpError(401))  
        }
        req.user = user
        next()   
    } catch {
        next(HttpError(401))
    }
}

export default authenticate