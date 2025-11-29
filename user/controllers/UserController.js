import User from '../models/User.js';
import UserView from '../views/UserView.js';
import { checkPassword, hashPassword } from '../util/hash.js';

export default class UserController {

    // criar usuário
    static async create(req, res) {
        try {
            const { name, cpf, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'name, email e password são obrigatórios' });
            }

            // verificar se já existe usuário com o mesmo email
            const existingUser = await User.getByEmail(email);
            if (existingUser) {
                return res.status(409).json({ error: 'Já existe um usuário com o mesmo email' });
            }

            const hashedPassword = await hashPassword(password);

            const user = await User.create({ name, cpf, email, password_hash: hashedPassword });
            return res.status(201).json(UserView.render(user));
        } catch (error) {
            console.error('Erro em UserController.create', error);
            return res.status(500).json({ error: `Erro interno ao criar usuário` });
        }
    }

    // criar atendente
    static async createAttendant(req, res) {
        try {
            const { name, cpf, email, password } = req.body;

            if (!name || !email || !password) {
                return res.status(400).json({ error: 'name, email e password são obrigatórios' });
            }

            const hashedPassword = await hashPassword(password);

            const user = await User.create({ name, cpf, email, password_hash: hashedPassword, is_attendant: 1 });
            return res.status(201).json(UserView.render(user));
        } catch (error) {
            console.error('Erro em UserController.create', error);
            return res.status(500).json({ error: `Erro interno ao criar usuário` });
        }
    }

    // buscar dados do usuário
    static async getMyData(req, res) {
        try {
            const id = req.user.id;

            const user = await User.get(id);
            return res.status(200).json(UserView.render(user));

        } catch (error) {
            console.error('Erro em UserController.getMyData', error);
            return res.status(500).json({ error: `Erro ao buscar dados do usuário` });
        }
    }

    // buscar usuário por ID
    static async get(req, res) {
        try {

            // dados da query
            const searchId = req.params.user_id;

            // dados do token
            const is_attendant = req.user.is_attendant;
            const selfId = req.user.id;

            // se for procurar outro usuário, verificar permissão
            if ((searchId !== selfId) || !is_attendant) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }

            const user = await User.get(searchId);
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            return res.status(200).json(UserView.render(user));
        } catch (error) {
            console.error('Erro em UserController.get', error);
            return res.status(500).json({ error: `Erro ao buscar usuário` });
        }
    }


    // buscar usuário por email
    static async getByEmail(req, res) {
        try {
            const email = req.params.email;
            const is_attendant = req.user.is_attendant;

            if (!is_attendant) {
                return res.status(403).json({ error: 'Somente atendentes podem buscar outros usuários' });
            }

            const user = await User.getByEmail(email);
            if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

            return res.status(200).json(UserView.render(user));
        } catch (error) {
            console.error('Erro em UserController.getByEmail', error);
            return res.status(500).json({ error: `Erro ao buscar usuário` });
        }
    }

    // confirmar login
    static async login(req, res) {
        try {

            const { email, password } = req.body;
            if (!email || !password) return res.status(400).json({ error: 'email e password são obrigatórios' });

            const user = await User.getByEmail(email);
            if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

            const match = await checkPassword(password, user.password_hash);
            if (!match) return res.status(401).json({ error: 'Credenciais inválidas' });

            return res.status(200).json(UserView.render(user));
        } catch (error) {
            console.error('Erro em UserController.login', error);
            return res.status(500).json({ error: `Erro ao logar` });
        }
    }

    // atualizar usuário
    static async update(req, res) {
        try {
            const { id: selfId, is_attendant: iAmAttendant } = req.user;
            const { name, email, password, cpf } = req.body;
            const { user_id: editingId } = req.params;

            // verificar permissões
            if (!(iAmAttendant || selfId == editingId)) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }

            // se for atualizar a senha, hash antes de enviar pro model
            let newPassword = password;
            if (password) newPassword = await hashPassword(password);

            await User.update(editingId, { name, email, password_hash: newPassword, cpf });
            const updatedUser = await User.get(editingId);

            return res.status(200).json(UserView.render(updatedUser));
        } catch (error) {
            console.error('Erro em UserController.update', error);
            return res.status(500).json({ error: `Erro ao atualizar usuário` });
        }
    }

    // promover usuário a atendente
    static async promote(req, res) {
        try {
            const { id: selfId, is_attendant: iAmAttendant } = req.user;
            const { user_id: editingId } = req.params;

            // verificar permissões
            if (!(iAmAttendant || selfId == editingId)) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }

            await User.update(editingId, { is_attendant: true });
            return res.status(204).send();

        } catch (error) {
            console.error('Erro em UserController.promote', error);
            return res.status(500).json({ error: `Erro ao promover usuário` });
        }
    }

    // rebaixar usuário
    static async demote(req, res) {
        try {
            const { id: selfId, is_attendant: iAmAttendant } = req.user;
            const { user_id: editingId } = req.params;

            // verificar permissões
            if (!(iAmAttendant || selfId == editingId)) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }

            await User.update(editingId, { is_attendant: false });
            return res.status(204).send();
        } catch (error) {
            console.error('Erro em UserController.demote', error);
            return res.status(500).json({ error: `Erro ao rebaixar usuário` });
        }
    }

    // deletar usuário
    static async delete(req, res) {
        try {
            const selfId = req.user.id;
            const deletingId = req.params.user_id;

            if (selfId != deletingId) {
                return res.status(403).json({ error: 'Permissão insuficiente' });
            }

            await User.delete(deletingId);
            return res.status(204).send();
        } catch (error) {
            console.error('Erro em UserController.delete', error);
            return res.status(500).json({ error: `Erro ao deletar usuário` });
        }
    }

}
