import DatabaseFactory from '../database/DatabaseFactory.js';

export default class Enrollment {

    static async create({ user_id, event_id, source = 'web' }) {
        try {
            const db = DatabaseFactory.getInstance();
            const sql = `
                INSERT INTO Enrollments (user_id, event_id, source, status)
                VALUES (?, ?, ?, 'pending')
            `;
            const result = await db.execute(sql, [user_id, event_id, source]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error creating enrollment:', error);
            throw error;
        }
    }

    static async getByEventId(event_id) {
        try {
            const db = DatabaseFactory.getInstance();
            const sql = `SELECT * FROM Enrollments WHERE event_id = ?`;
            const rows = await db.execute(sql, [event_id]);
            return rows;
        } catch (error) {
            console.error('Error getting enrollment by event ID:', error);
            throw error;
        }
    }

    static async getByUserId(userId) {
        try {
            const db = DatabaseFactory.getInstance();
            const sql = `SELECT * FROM Enrollments WHERE user_id = ?`;
            const rows = await db.execute(sql, [userId]);
            return rows;
        } catch (error) {
            console.error('Error getting enrollment by user ID:', error);
            throw error;
        }
    }

    static async getByUserAndEvent(user_id, event_id) {
        try {
            const db = DatabaseFactory.getInstance();
            const sql = `SELECT * FROM Enrollments WHERE user_id = ? AND event_id = ?`;
            const rows = await db.execute(sql, [user_id, event_id]);
            return rows[0];
        } catch (error) {
            console.error('Error getting enrollment by ID:', error);
            throw error;
        }
    }

    static async update(event_id, user_id, { status, checkin_time }) {
        try {
            const db = DatabaseFactory.getInstance();

            // Busca a inscrição e verifica se ela existe
            const enrollment = await this.getByUserAndEvent(user_id, event_id);
            if (!enrollment) {
                return false;
            }

            let sql = `UPDATE Enrollments SET `;
            const params = [];
            const updates = [];

            if (status) {
                updates.push(`status = ?`);
                params.push(status);
            }

            if (checkin_time) {
                updates.push(`checkin_time = ?`);
                params.push(checkin_time);
            }

            if (updates.length === 0) return false;

            sql += updates.join(', ') + ` WHERE user_id = ? AND event_id = ?`;
            params.push(user_id, event_id);

            const result = await db.execute(sql, params);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error updating enrollment:', error);
            throw error;
        }
    }

}