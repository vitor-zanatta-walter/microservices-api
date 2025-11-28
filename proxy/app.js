import http from "http";
import https from "https";
import fs from "fs";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import auditMiddleware from "./middleware/auditMiddleware.js";
import dotenv from "dotenv";
dotenv.config();

import loginRouter from "./login.js";
import createProxyAuthMiddleware from "./middleware/authMiddleware.js";
import cors from "cors";

const app = express();
app.use(cors());

// carregar variáveis de ambiente 
const BLOCKED_PATHS = Object.keys(process.env)
    .filter(key => key.startsWith("BLOCKED_PATH_"))
    .map(key => process.env[key].trim());

const LISTEN_PORT = process.env.LISTEN_PORT;
const USE_HTTPS = (process.env.USE_HTTPS === "true");
const HTTPS_KEY = process.env.HTTPS_KEY;
const HTTPS_CERT = process.env.HTTPS_CERT;
const KEEP_PATH = (process.env.KEEP_PATH === "true");

// parse public routes
const PUBLIC_ROUTES = Object.keys(process.env)
    .filter(key => key.startsWith("PUBLIC_ROUTE_"))
    .map(key => {
        const [method, path] = process.env[key].split(':');
        return { method: method.trim(), path: path.trim() };
    });

// instanciar o middleware de autenticação
const authMiddleware = createProxyAuthMiddleware({
    publicPaths: PUBLIC_ROUTES
});

// configuração do certificado
const options = {};
if (USE_HTTPS) {
    options.key = fs.readFileSync(HTTPS_KEY);
    options.cert = fs.readFileSync(HTTPS_CERT);
}

// metodo para reescrever o caminho
const pathRewrite = (path, from) => {
    if (KEEP_PATH) {
        return path;
    }

    if (path.startsWith(from)) {
        let newPath = path.slice(from.length) || "/";
        newPath = newPath.startsWith("/") ? newPath : "/" + newPath;
        return newPath;
    }

    return path;
}

// carregar as regras de encaminhamento
const rules = Object.keys(process.env)
    .filter((key) => key.startsWith("RULE_"))
    .map((key) => {
        const line = process.env[key];
        const rule = line.split("->");
        const from = rule[0].trim();
        const to = rule[1].trim();

        // cria o proxy e injeta header x-proxy-user se req.proxyToken existir
        const proxy = createProxyMiddleware({
            target: to,
            changeOrigin: true,
            pathRewrite: (path) => pathRewrite(path, from),
            onProxyReq(proxyReq, req) {
                if (req && req.proxyToken) {
                    proxyReq.setHeader('Authorization', `Bearer ${req.proxyToken}`);
                }
            }
        });

        return { from, to, proxy };
    })

app.use(auditMiddleware());

// rota para autenticação
app.use(loginRouter);

// proxy
app.use((req, res, next) => {

    // ignorar caminhos bloqueados
    if (BLOCKED_PATHS.some(p => req.url.startsWith(p))) {
        console.log(`[BLOCKED] ${req.method} ${req.url}`);
        return res.status(403).json({ error: "blocked by proxy" });
    }

    // procurar regras
    for (const rule of rules) {
        if (req.url.startsWith(rule.from)) {
            const path = pathRewrite(req.url, rule.from);
            console.log(`[Proxy] ${req.method} ${req.url} -> ${rule.to + path}`);

            // authMiddleware
            return authMiddleware(req, res, (err) => {
                if (err) return next(err);
                return rule.proxy(req, res, next);
            });
        }
    }

    next();
});

// Inicia o servidor (http ou https)
if (USE_HTTPS) {

    if (!HTTPS_KEY || HTTPS_KEY == "" || !HTTPS_CERT || HTTPS_CERT == "") {
        console.error("HTTPS_KEY ou HTTPS_CERT não foram configurados no arquivo .env");
        process.exit(1);
    }

    https.createServer(options, app).listen(LISTEN_PORT, () => {
        console.log(`Proxy rodando em https na porta ${LISTEN_PORT}`);
    });

    http.createServer((req, res) => {
        res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
        res.end();
    }).listen(80);

} else {

    app.listen(LISTEN_PORT, () => {
        console.log(`Proxy rodando em http na porta ${LISTEN_PORT}`);
    });
}
