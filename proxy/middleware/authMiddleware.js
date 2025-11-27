import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export default function createProxyAuthMiddleware({
  proxyPrivateKeyPath = './keys/private.pem',
  proxyPublicKeyPath = './keys/public.pem',
  
  publicPaths = [
    { method: 'POST', path: '/api/login' },
    { method: 'POST', path: '/api/users' },
    { method: 'GET', path: '/api/users/ping' },
    { method: 'POST', path: '/api/users/internal/create_attendant' }
  ],

  proxyTTLSeconds = 120
} = {}) {

  const proxyPrivate = fs.readFileSync(path.resolve(proxyPrivateKeyPath), 'utf8');
  const proxyPublic = fs.readFileSync(path.resolve(proxyPublicKeyPath), 'utf8');

  const isPublic = (req) => publicPaths.some(p => p.method.toUpperCase() === req.method.toUpperCase() && p.path === req.path);

  const verifyClientToken = (token) => jwt.verify(token, proxyPublic, { algorithms: ['RS256'] });

  const issueProxyToken = (claims) => {
    const payload = {
      sub: claims.sub,
      name: claims.name,
      email: claims.email,
      is_attendant: claims.is_attendant
    };
    return jwt.sign(payload, proxyPrivate, { algorithm: 'RS256', expiresIn: `${proxyTTLSeconds}s` });
  };

  return function proxyAuthMiddleware(req, res, next) {

    if (isPublic(req)) return next();

    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'missing token' });

    let clientClaims;
    try {
      clientClaims = verifyClientToken(token);
    } catch (err) {
      return res.status(401).json({ error: 'invalid client token' });
    }

    // map minimal claims and issue proxy token
    const proxyToken = issueProxyToken(clientClaims);

    // attach for proxying
    req.proxyToken = proxyToken;
    req.proxyUser = {
      id: clientClaims.sub,
      name: clientClaims.name,
      email: clientClaims.email,
      is_attendant: clientClaims.is_attendant
    };

    return next();
  };

}
