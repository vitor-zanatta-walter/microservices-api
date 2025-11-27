import Database from "./Database.js";

export default class DatabaseFactory {

    static getInstance() {

        return Database.getInstance({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }

}