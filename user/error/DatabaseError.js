// errors/DatabaseError.js
export default class DatabaseError extends Error {
  constructor(message, originalError) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError; // guarda o erro real do mysql
  }
}
