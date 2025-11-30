import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';

export default function createProxyAuthMiddleware({
  proxyPrivateKeyPath = './keys/private.pem',
  proxyPublicKeyPath = './keys/public.pem',

  publicPaths = [],

  proxyTTLSeconds = 120
} = {}) {

  const proxyPrivate = fs.readFileSync(path.resolve(proxyPrivateKeyPath), 'utf8');
  const proxyPublic = fs.readFileSync(path.resolve(proxyPublicKeyPath), 'utf8');

  const isPublic = (req) => {
    // Extract pathname from req.url (remove query string)
    const pathname = req.url.split('?')[0];

    return publicPaths.some(p => {
      if (p.method.toUpperCase() !== req.method.toUpperCase()) return false;

      if (p.path.endsWith('*')) {
        // Remove the * and any trailing /
        const basePath = p.path.slice(0, -1).replace(/\/$/, '');
        // Match if pathname starts with basePath or basePath/
        return pathname === basePath || pathname.startsWith(basePath + '/');
      }

      return p.path === pathname;
    });
  };

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

    // Skip authentication for non-API routes (frontend routes)
    if (!req.url.startsWith('/api')) {
      console.log(`[AUTH] Skipping auth for frontend route: ${req.url}`);
      return next();
    }

    // Check if API route is public
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
