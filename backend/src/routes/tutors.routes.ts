import { Router } from 'express';
import { TutorsController } from '../controllers/tutors.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/role.middleware';
import { uploadTutorDocs } from '../config/upload';

const router = Router();
const controller = new TutorsController();

// JSON (perfil)
router.put('/me', authenticate, authorize('TUTOR'), controller.updateMe.bind(controller));

// multipart (docs)
router.post(
    '/me/documents',
    authenticate,
    authorize('TUTOR'),
    uploadTutorDocs.fields([
        { name: 'comprovante', maxCount: 1 },
        { name: 'identidade', maxCount: 1 }
    ]),
    controller.uploadDocuments.bind(controller)
);

// COORDENADOR
router.get('/pending', authenticate, authorize('COORDENADOR'), controller.pending.bind(controller));
router.put('/:id/validate', authenticate, authorize('COORDENADOR'), controller.validate.bind(controller));

export default router;
