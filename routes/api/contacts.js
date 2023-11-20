import express from 'express'
import contactsController from '../../controllers/contacts-controller.js'
import { isEmptyBody, isValidId } from '../../middlewares/index.js'
import { validateBody } from '../../decorators/index.js'
import { contactAddSchema, contactFavoriteSchema, contactUpdateSchema } from '../../schemas/contact-schemas.js'

const router = express.Router()

router.get('/', contactsController.getAllContacts)

router.get('/:contactId', isValidId, contactsController.getById)

router.post('/', isEmptyBody,  validateBody(contactAddSchema), contactsController.add)

router.put('/:contactId', isValidId, isEmptyBody, validateBody(contactUpdateSchema), contactsController.updateById)

router.patch('/:contactId/favorite', isValidId, isEmptyBody, validateBody(contactFavoriteSchema), contactsController.updateStatusContact)

router.delete('/:contactId', isValidId, contactsController.deleteById)

export default router
