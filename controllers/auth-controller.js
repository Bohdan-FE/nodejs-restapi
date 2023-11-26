
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import gravatar from 'gravatar'
import path from 'path'
import Jimp from "jimp"
import fs from 'fs/promises'
import { nanoid } from 'nanoid'
import { HttpError, sendEmail } from '../helpers/index.js' 
import { ctrlWrapper } from '../decorators/index.js'

const avatarDir = path.resolve('public', 'avatars')

const register = async (req, res) => {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (user) {
        throw HttpError(409, 'Email is already in use')
    }

    const hashPassword = await bcrypt.hash(password, 10)
    const avatarURL = gravatar.url(email)
    const verificationToken = nanoid()

    const newUser = await User.create({ ...req.body, password: hashPassword, verificationToken })

    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target="_blank" href="${process.env.BASE_URL}/users/verify/${verificationToken}">Verify email</a>`
    }

    await sendEmail(verifyEmail)

    res.status(201).json({
        user: {email: newUser.email, subscription: newUser.subscription, avatarURL}
    })
}

const verifyEmail = async (req, res) => {
    const { verificationToken } = req.params
    const user = await User.findOne({ verificationToken })

    if (!user) {    
        throw HttpError(404, 'User not found')
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: '' })

    res.json({ message: 'Verification successful' })
}

const resendVerifyToken = async (req, res) => {
    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
        throw HttpError(401, 'Email not found')
    }

    if (user.verify) {
        throw HttpError(400, "Verification has already been passed")
    }

    const verifyEmail = {
        to: email,
        subject: 'Verify email',
        html: `<a target="_blank" href="${process.env.BASE_URL}/users/verify/${user.verificationToken}">Verify email</a>`
    }

    await sendEmail(verifyEmail)

    res.json({ message: "Verification email sent" })
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

    if (!user.verify) {
        throw HttpError(401, 'Email not verify')
    }
    
    const payload = {
        id: user._id    
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: '23h' })

    await User.findByIdAndUpdate(user._id, { token })
    
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

    const file = await Jimp.read(tempUpload)
    await file.resize(250, 250).writeAsync(tempUpload)
    
    await fs.rename(tempUpload, resultUpload)
    
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
    updateAvatar: ctrlWrapper(updateAvatar),
    verifyEmail: ctrlWrapper(verifyEmail),
    resendVerifyToken: ctrlWrapper(resendVerifyToken)
}