import { HttpError } from '../helpers/index.js' 
import { ctrlWrapper } from '../decorators/index.js'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import gravatar from 'gravatar'
import path from 'path'
import Jimp from "jimp"
import fs from 'fs/promises'

const avatarDir = path.resolve('public', 'avatars')

const register = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (user) {
        throw HttpError(409, 'Email is already in use')
    }
    const hashPassword = await bcrypt.hash(password, 10)
    const avatarURL = gravatar.url(email)
    const newUser = await User.create({ ...req.body, password: hashPassword })
    res.status(201).json({
        user: {email: newUser.email, subscription: newUser.subscription, avatarURL}
    })
}

const login = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
        throw HttpError(401, 'Email or password invalid')
    }
    const passwordCompare = await bcrypt.compare(password, user.password)
    if (!passwordCompare) {
        throw HttpError(401, 'Email or password invalid')
    }
    const payload = {
        id: user._id    
    }
    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '23h' })
    await User.findByIdAndUpdate(user._id, {token})
    res.json({
        token,
        user: {
            email: user.email,
            subscription: user.subscription
        }
    }) 
}

const getCurrent = async (req, res) => {
    const { email, subscription } = req.user
    res.json({
        email,
        subscription
    })
}

const logout = async (req, res) => {
    const { _id } = req.user
    await User.findByIdAndUpdate(_id, { token: '' })
    res.status(204).json()
}

const updateAvatar = async (req, res) => {
    const { _id } = req.user
    const { path: tempUpload, originalname } = req.file
    const newFileName = `${_id}_${originalname}`
    const resultUpload = path.join(avatarDir, newFileName)

    await fs.rename(tempUpload, resultUpload)

    const file = await Jimp.read(resultUpload);
    file.resize(250, 250).write(resultUpload)
  
    const avatarURL = path.join('avatars', newFileName)
    await User.findByIdAndUpdate(_id, { avatarURL })
    res.json({
        avatarURL
    })
}

export default {
    register: ctrlWrapper(register),
    login: ctrlWrapper(login),
    getCurrent: ctrlWrapper(getCurrent),
    logout: ctrlWrapper(logout),
    updateAvatar: ctrlWrapper(updateAvatar)
}