import express from 'express'
import contactsController from '../../controllers/contacts-controller.js'
import { isEmptyBody, isValidId, authenticate } from '../../middlewares/index.js'
import { validateBody } from '../../decorators/index.js'
import { contactAddSchema, contactFavoriteSchema, contactUpdateSchema } from '../../models/Contact.js'

const router = express.Router()

router.get('/', authenticate, contactsController.getAllContacts)

router.get('/:contactId', authenticate, isValidId, contactsController.getById)

router.post('/', authenticate, isEmptyBody,  validateBody(contactAddSchema), contactsController.add)

router.put('/:contactId', authenticate, isValidId, isEmptyBody, validateBody(contactUpdateSchema), contactsController.updateById)

router.patch('/:contactId/favorite', authenticate , isValidId, isEmptyBody, validateBody(contactFavoriteSchema), contactsController.updateStatusContact)

router.delete('/:contactId', authenticate, isValidId, contactsController.deleteById)

export default router
