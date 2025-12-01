import Enrollment from '../models/Enrollment.js';
import { getEvent, getUserById } from '../utils/internalRequest.js';

class EnrollmentsController {

    // Cria uma nova inscrição
    static async create(req, res) {
        try {
            const { user_id, event_id, source } = req.body;
            const MyID = req.user.id;
            const status = 'pending';

            const token = req.headers.authorization?.replace("Bearer ", "");

            // Valida se eu estou me inscrevendo ou é um atendente fazendo minha inscrição
            if (user_id !== MyID && !req.user.is_attendant) {
                return res.status(403).json({ message: 'Apenas o usuário ou um atendente pode fazer a inscrição' });
            }

            // Valida se o evento existe no microsserviço de eventos
            const event = await getEvent(event_id, token);
            if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

            // Valida se o evento ainda não acabou
            if (event.end_date < new Date()) {
                return res.status(400).json({ message: 'Evento já finalizado' });
            }

            // Verifica se o usuário já está inscrito neste evento
            const existingEnrollment = await Enrollment.getByUserAndEvent(user_id, event_id);
            if (existingEnrollment) {
                // Se a inscrição foi cancelada, permite re-inscrição atualizando o status e source
                if (existingEnrollment.status === 'cancelled') {
                    const success = await Enrollment.update(event_id, user_id, { status: 'pending', source });
                    if (!success) {
                        return res.status(500).json({ message: 'Erro ao reativar inscrição' });
                    }
                    return res.status(200).json({
                        message: 'Inscrição reativada com sucesso',
                        event_id,
                        source,
                        user_id,
                        status: 'pending'
                    });
                }
                // Se a inscrição está ativa (pending, present, etc), não permite duplicar
                return res.status(409).json({ message: 'Usuário já inscrito neste evento' });
            }

            const success = await Enrollment.create({ event_id, source, user_id, status });
            if (!success) {
                return res.status(500).json({ message: 'Erro ao criar inscrição' });
            }
            res.status(201).json({ event_id, source, user_id, status });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Busca todas as inscrições de um usuário
    static async getMyEnrollments(req, res) {
        try {
            const MyID = req.user.id;

            const enrollments = await Enrollment.getByUserId(MyID);
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Busca inscrições por usuario
    static async getByUserId(req, res) {
        try {
            const { user_id } = req.params;
            const enrollments = await Enrollment.getByUserId(user_id);
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Busca uma inscrição pelo evento e usuario
    static async getById(req, res) {
        try {
            const { event_id, user_id } = req.params;
            const enrollment = await Enrollment.getByUserAndEvent(user_id, event_id);
            if (!enrollment) {
                return res.status(404).json({ message: 'Inscrição não encontrada' });
            }
            res.json(enrollment);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Busca todas as inscrições
    static async getAll(req, res) {
        try {
            const enrollments = await Enrollment.getAll();
            res.json(enrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Busca todas as inscrições de um evento
    // Busca todas as inscrições de um evento
    static async getByEventId(req, res) {
        try {
            const { event_id } = req.params;
            const token = req.headers.authorization?.replace("Bearer ", "");

            const enrollments = await Enrollment.getByEventId(event_id);

            // Enrich enrollments with user data
            const enrichedEnrollments = await Promise.all(enrollments.map(async (enrollment) => {
                const user = await getUserById(enrollment.user_id, token);
                return {
                    ...enrollment,
                    user_name: user ? user.name : null,
                    user_email: user ? user.email : null
                };
            }));

            res.json(enrichedEnrollments);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Confirma a presença do usuário (Apenas atendentes)
    static async givePresence(req, res) {
        try {
            const { event_id, user_id, checkin_time } = req.params;

            // Verifica se o usuário é um atendente
            if (!req?.user?.is_attendant) {
                return res.status(403).json({ message: 'Apenas atendentes podem confirmar presença.' });
            }

            const updateData = {
                event_id,
                user_id,
                checkin_time: checkin_time || new Date(),
                status: 'present'
            };

            const success = await Enrollment.update(event_id, user_id, updateData);
            if (!success) {
                return res.status(404).json({ message: 'Inscrição não encontrada' });
            }
            res.json({ message: 'Presença confirmada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Cancela a inscrição do usuário
    static async cancel(req, res) {
        try {
            const { event_id, user_id } = req.params;

            // Busca a inscrição para verificar permissão
            const enrollment = await Enrollment.getByUserAndEvent(user_id, event_id);
            if (!enrollment) {
                return res.status(404).json({ message: 'Inscrição não encontrada' });
            }

            // Verifica permissão: Dono ou Atendente
            if (enrollment.user_id !== req.user.id && !req.user.is_attendant) {
                return res.status(403).json({ message: 'Acesso negado' });
            }

            const updateData = { status: 'cancelled' };

            const success = await Enrollment.update(event_id, user_id, updateData);

            if (!success) { return res.status(404).json({ message: 'Inscrição não encontrada' }) }
            res.json({ message: 'Inscrição cancelada com sucesso' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

export default EnrollmentsController;
