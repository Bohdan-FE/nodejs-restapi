import { HttpError } from '../helpers/index.js' 
import { ctrlWrapper } from '../decorators/index.js'
import Contact from '../models/Contact.js'


const getAllContacts = async (req, res) => {
        const { _id: owner, email, subscription } = req.user 
        const { page = 1, limit = 10 } = req.query
        const skip = (page -1 ) * limit
        const result = await Contact.find({ owner }, '-createdAt -updatedAt -owner', { skip, limit })
        const totalContacts = await Contact.countDocuments({owner})
        res.json({
                contacts: result,
                owner: {_id: owner, email, subscription},
                page,
                totalContacts,
                totalPages: Math.ceil(totalContacts/limit),
                contactsPerPage: limit
        })   
}

const getById = async (req, res) => {
        const { contactId } = req.params
        const result = await Contact.findById(contactId)
        if (!result) {
            throw HttpError(404, `Contact with id:${contactId} is not found`)
        }
        res.json(result)    
}

const add = async (req, res) => {
        const { _id: owner } = req.user
        const result = await Contact.create({ ...req.body, owner })
        res.status(201).json(result)
}


const updateById = async (req, res) => {
        const { contactId } = req.params
        const result = await Contact.findByIdAndUpdate(contactId, req.body)
         if (!result) {
            throw HttpError(404, `Contact with id:${contactId} is not found`)
        }
         res.json(result)
}

const deleteById = async (req, res) => {
        const {contactId} = req.params
        const result = await Contact.findByIdAndDelete(contactId)
        if (!result) {
            throw HttpError(404, `Contact with id:${contactId} is not found`)
        }
        res.json({message: 'contact deleted'})
}

const updateStatusContact = async (req, res) => {
        const { contactId } = req.params
        const result = await Contact.findByIdAndUpdate(contactId, req.body)
         if (!result) {
            throw HttpError(404, 'Not found')
        }
         res.json(result)
}

export default {
    getAllContacts: ctrlWrapper(getAllContacts),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteById: ctrlWrapper(deleteById),
    updateStatusContact: ctrlWrapper(updateStatusContact)
}