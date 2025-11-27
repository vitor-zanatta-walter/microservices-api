import fs from 'fs';
import jwt from 'jsonwebtoken';
import express from 'express';

const router = express.Router();

// config — ajuste caminhos/URLs conforme seu projeto
const PROXY_PRIVATE_KEY = fs.readFileSync('./keys/private.pem', 'utf8');
const PROXY_TTL = '1d';
const USER_SERVICE_VERIFY = 'http://localhost:3001/internal/auth/validate'; 


// Função que chama o microserviço de usuário para validar 
async function validateCredentials(email, password) {
  const res = await fetch(USER_SERVICE_VERIFY, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (res.status !== 200) throw { status: res.status };
  
  const payload = await res.json();
  return payload;
}


// cria token de cliente
function generateClientToken(user) {
  
  const claims = {
    sub: user.id,
    name: user.name,
    email: user.email,
    is_attendant: user.is_attendant,
  };

  return jwt.sign(claims, PROXY_PRIVATE_KEY, { algorithm: 'RS256', expiresIn: PROXY_TTL });
}

// rota para autenticação
router.post('/api/login', express.json(), async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email e senha são obrigatórios' });

    const user = await validateCredentials(email, password);
    const clientToken = generateClientToken(user);  
    return res.json({ access_token: clientToken, token_type: 'Bearer', expires_in: PROXY_TTL });
  
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message });
  }
});



export default router;
