// Erros
import DatabaseError from '../error/DatabaseError.js';
import ValidationError from '../error/ValidationError.js';

import DatabaseFactory from '../database/DatabaseFactory.js';
import updateQueryGenerator from '../util/updateQueryGenerator.js';


export default class User {

    constructor({ id, name, email, password_hash, cpf, is_attendant }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password_hash = password_hash;
        this.cpf = cpf;
        this.is_attendant = is_attendant;
    }

    // criar usuário
    static async create({ name, email, password_hash, cpf, is_attendant }) {
        const db = DatabaseFactory.getInstance();

        if (!name || !email || !password_hash) {
            throw new ValidationError('name, email e password são obrigatórios para o create');
        }

        const query = `
            INSERT INTO Users (name, email, password_hash, cpf, is_attendant) 
            VALUES (?, ?, ?, ?, ?);
        `;

        if (!is_attendant) is_attendant = 0;
        if (!cpf) cpf = null;

        const params = [name, email, password_hash, cpf, is_attendant];

        try {
            const result = await db.execute(query, params);
            return new User({ id: result.insertId, ...params });
        } catch (err) {
            throw new DatabaseError('Erro ao criar usuário', err);
        }
    }

    // atualizar usuário
    static async update(id, { name, email, password_hash, cpf, is_attendant }) {
        const db = DatabaseFactory.getInstance();

        if (!id) throw new ValidationError('ID é obrigatório para o update');

        const table = "Users";
        const items = [name, email, password_hash, cpf, is_attendant];
        const names = ["name", "email", "password_hash", "cpf", "is_attendant"];
        const where = "Users.id = ?";
        const whereParams = [id];

        const { query, params } = updateQueryGenerator(table, items, names, where, whereParams);

        try {
            const result = await db.execute(query, params);
            return result;
        } catch (err) {
            throw new DatabaseError('Erro ao atualizar usuário', err);
        }
    }

    // deletar usuário
    static async delete(id) {
        const db = DatabaseFactory.getInstance();
        try {
            const query = `DELETE FROM Users WHERE Users.id = ?`;
            const result = await db.execute(query, [id]);
            return result;
        } catch (err) {
            throw new DatabaseError('Erro ao deletar usuário', err);
        }
    }

    // buscar usuário pelo email
    static async getByEmail(email) {
        const db = DatabaseFactory.getInstance();

        try {
            const query = "SELECT * FROM Users WHERE Users.email = ?";
            const result = await db.execute(query, [email]);
            return result[0];
        } catch (err) {
            throw new DatabaseError('Erro ao buscar usuário', err);
        }
    }

    // buscar usuário pelo ID
    static async get(id) {
        const db = DatabaseFactory.getInstance();

        try {
            const query = "SELECT * FROM Users WHERE Users.id = ?";
            const result = await db.execute(query, [id]);
            return result[0];
        } catch (err) {
            throw new DatabaseError('Erro ao buscar usuário', err);
        }
    }


}
