import jwt from "jsonwebtoken";
import PUBLIC_KEY from "./publicKey.js";

export default function authMiddleware(req, res, next) {
    const token = req.headers["authorization"]?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ error: "Token ausente" })
    }

    try {
        // Verifica o token usando a chave pública
        const payload = jwt.verify(token, PUBLIC_KEY, {
            algorithms: ["RS256"],
        });

        // Injeta o usuário e permissões no req
        req.user = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            is_attendant: payload.is_attendant == 1,
        };

        return next();
    } catch (err) {
        return res.status(401).json({ error: "Token inválido" });
    }
}

