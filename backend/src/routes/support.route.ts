import { Router } from 'express';
import { submitContact } from '../controllers/support.controller';
import { validateResource } from '../middlewares/validate.middleware';
import { contactSchema } from '../validators/support.validator';

const router = Router();

router.post('/contact', validateResource(contactSchema), submitContact);

export const supportRouter = router;


