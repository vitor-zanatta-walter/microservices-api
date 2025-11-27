import mysql from 'mysql2/promise';

export default class Database {
    static instance;
    static pool;

    // singleton
    static getInstance(config) {

        if (!Database.instance) {

            // cria o pool na primeira vez
            Database.pool = mysql.createPool({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database
            });

            // cria a instância com métodos
            Database.instance = new Database();
        }
        return Database.instance;
    }


    // INSERT, UPDATE, DELETE
    async execute(sql, params = []) {
        const safeParams = params.map(p => p === undefined ? null : p);
        const [result] = await Database.pool.execute(sql, safeParams);
        return result;
    }
}