import bcrypt from 'bcrypt';

// criptografar senha
export async function hashPassword(password) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(password, saltRounds);
    return hashed;
}

// verificar senha
export async function checkPassword(inputPassword, storedHash) {
  const match = await bcrypt.compare(inputPassword, storedHash);
  return match;
}
