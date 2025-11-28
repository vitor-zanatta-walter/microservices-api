import express from 'express';
import enrollmentsController from '../controllers/enrollmentsController.js';
import SyncController from '../controllers/syncController.js';

const router = express.Router();


// Inserir uma nova inscrição
router.post('/', enrollmentsController.create);

// Sincronizar dados offline (presença e inscrições)
router.post('/events/:event_id/sync', SyncController.sync);

// Buscar inscrições do usuário logado
router.get('/me', enrollmentsController.getMyEnrollments);

// Buscar uma inscrição por evento e usuario
router.get('/events/:event_id/users/:user_id', enrollmentsController.getById);

// Buscar todas inscrições de um evento
router.get('/events/:event_id', enrollmentsController.getByEventId);

// Buscar inscrição por usuario
router.get('/users/:user_id', enrollmentsController.getByUserId);

// Dar presença
router.post('/events/:event_id/users/:user_id/presence', enrollmentsController.givePresence);

// Cancelar inscrição
router.delete('/events/:event_id/users/:user_id', enrollmentsController.cancel);

export default router;
