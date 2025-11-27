import DatabaseFactory from '../database/DatabaseFactory.js';

// normaliza IPv6 para IPv4
function normalizeIP(ip) {
  if (!ip) return null;

  // se vier como "::ffff:192.168.0.10"
  if (ip.startsWith("::ffff:")) {
    return ip.replace("::ffff:", "");
  }

  // se vier como "::1" (localhost IPv6)
  if (ip === "::1") {
    return "127.0.0.1";
  }

  return ip;
}

export default function auditMiddleware() {
    return (req, res, next) => {
        const start = Date.now();

       // espera a resposta terminar
        res.on('finish', () => {
            
            const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString();
            const normalizedIP = normalizeIP(ip);
            const route = req.originalUrl || req.url;
            const method = req.method;
            const status_code = res.statusCode;
            const userId = req?.proxyUser?.id;

            // fire-and-forget insert (async function)
            (async () => {
                try {
                    const db = DatabaseFactory.getInstance();
                    
                    const sql = `
                        INSERT INTO AuditLogs (ip, user_id, route, method, status_code)
                        VALUES (?, ?, ?, ?, ?);
                    `;

                    await db.execute(sql, [normalizedIP, userId, route, method, status_code]);

                } catch (err) {
                    console.error('[audit] failed to insert audit log:', err && err.message ? err.message : err);
                }
            })();
        });

        next();
    };
}
