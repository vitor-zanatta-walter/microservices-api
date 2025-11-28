import crypto from 'crypto';
import Enrollment from '../models/Enrollment.js';
import { getEvent, getUserByEmail, createUser } from '../utils/internalRequest.js';

class SyncController {

    static async sync(req, res) {
        try {
            const { event_id } = req.params;
            const { users } = req.body; // Expecting array of { name, email, checkin_time }

            if (!users || !Array.isArray(users)) {
                return res.status(400).json({ message: 'Lista de usuários inválida' });
            }

            // Verifica se o usuário é um atendente
            if (!req.user || !req.user.is_attendant) {
                return res.status(403).json({ message: 'Acesso negado. Apenas atendentes podem sincronizar dados.' });
            }

            const token = req.headers.authorization?.replace("Bearer ", "");

            // 1. Validar evento
            const event = await getEvent(event_id, token);
            if (!event) {
                return res.status(404).json({ message: 'Evento não encontrado' });
            }

            const processedUsers = [];
            const createdAccounts = [];

            for (const userData of users) {
                const { name, email, checkin_time } = userData;
                let userId = null;

                try {
                    // 2. Verificar se usuário existe
                    let user = await getUserByEmail(email, token);

                    if (!user) {
                        // 3. Criar usuário se não existir
                        const randomPassword = crypto.randomBytes(8).toString('hex');
                        const newUser = {
                            name,
                            email,
                            password: randomPassword,
                            confirmPassword: randomPassword
                        };

                        const createdUser = await createUser(newUser);
                        userId = createdUser.id; // Assuming createUser returns { id, ... } or similar

                        // Guardar credenciais para envio de email posterior
                        createdAccounts.push({
                            name,
                            email,
                            password: randomPassword
                        });
                    } else {
                        userId = user.id;
                    }

                    // 4. Verificar inscrição
                    const existingEnrollment = await Enrollment.getByUserAndEvent(userId, event_id);

                    if (!existingEnrollment) {
                        // 5. Criar inscrição se não existir
                        await Enrollment.create({
                            user_id: userId,
                            event_id: event_id,
                            source: 'local/offline'
                        });
                    }

                    // 6. Atualizar check-in (dar presença)
                    await Enrollment.update(event_id, userId, {
                        status: 'present',
                        checkin_time: checkin_time || new Date()
                    });

                    processedUsers.push({ email, status: 'synced' });

                } catch (err) {
                    console.error(`Erro ao processar usuário ${email}:`, err);
                    processedUsers.push({ email, status: 'error', error: err.message });
                }
            }

            res.json({
                message: 'Sincronização concluída',
                processed: processedUsers,
                created_accounts: createdAccounts // Retornando para uso posterior (email service)
            });

        } catch (error) {
            console.error('Erro na sincronização:', error);
            res.status(500).json({ error: error.message });
        }
    }
}

export default SyncController;
