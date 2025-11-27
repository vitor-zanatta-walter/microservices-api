import { Router } from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = Router();

// Importa o controller
import UserController from '../controllers/UserController.js';

// ping
router.get('/ping', (req, res) => res.send('pong'));

// criar usuário
router.post('/', UserController.create);

// validar login
router.post('/internal/auth/validate', UserController.login);

// Rota DEV, para criar um atendente
router.post('/internal/create_attendant', UserController.createAttendant);

// proteger rotas abaixo
router.use(authMiddleware);

// buscar dados do usuário
router.get('/me', UserController.getMyData);

// buscar usuário por email
router.get('/email/:email', UserController.getByEmail);

// promover usuário a atendente
router.post('/promote/:user_id', UserController.promote);

// rebaixar usuário
router.post('/demote/:user_id', UserController.demote);

// buscar usuário por ID
router.get('/:user_id', UserController.get);

// atualizar usuário
router.put('/:user_id', UserController.update);

// deletar usuário
router.delete('/:user_id', UserController.delete);

export default router;