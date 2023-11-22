import Joi from 'joi'
import { Schema, model } from "mongoose";
import { handleSaveError } from "./hooks.js";

const emailRegexp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
const subscriptionsList = ["starter", "pro", "business"]

const userSchema = new Schema({
  password: {
    type: String,
    required: [true, 'Set password for user'],
  },
  email: { 
    type: String,
    required: [true, 'Email is required'],
    match: emailRegexp,
    unique: true,
  },
  subscription: {
    type: String,
    enum: subscriptionsList,
    default: "starter"
  },
  token: String
}, { versionKey: false, timestamps: true })

userSchema.post('save', handleSaveError)

const User = model('user', userSchema)

export const registerSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
    subscription: Joi.string().valid(...subscriptionsList)
})

export const loginSchema = Joi.object({
    email: Joi.string().pattern(emailRegexp).required(),
    password: Joi.string().required(),
})

export default User