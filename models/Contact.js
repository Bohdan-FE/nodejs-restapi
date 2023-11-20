import Joi from 'joi'
import { Schema, model } from "mongoose";
import { handleSaveError, preUpdate } from "./hooks.js";

const contactSchema = new Schema( {
    name: {
      type: String,
      required: [true, 'Set name for contact'],
    },
    email: {
      type: String,
    },
    phone: {
      type: String,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
    }
}, { versionKey: false, timestamps: true })
  
contactSchema.post("save", handleSaveError)

contactSchema.pre('findOneAndUpdate', preUpdate)

contactSchema.post("findOneAndUpdate", handleSaveError)

const Contact = model('contact', contactSchema)

export const contactAddSchema = Joi.object({
    name: Joi.string().required().messages({
        'any.required': 'missing required name',
        'string.base': 'name must be string'
    }),
    email: Joi.string().required().messages({
        'any.required': 'missing required email',
        'string.base': 'email must be string'
    }),
    phone: Joi.string().required().messages({
        'any.required': 'missing required phone',
        'string.base': 'phone must be string'
    }),
    favorite: Joi.boolean()
})

export const contactUpdateSchema = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    favorite: Joi.boolean()
})
 
export const contactFavoriteSchema = Joi.object({
  favorite: Joi.boolean().required().messages({
      'any.required': 'missing required favorite',
      'string.base': 'favorite must be boolean'
    })
})

export default Contact  