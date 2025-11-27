import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PUBLIC_KEY;

try {
    const filePath = path.resolve(__dirname, "keys", "public.pem");
    PUBLIC_KEY = fs.readFileSync(filePath, "utf8");
} catch (error) {
    console.error("Erro ao carregar a chave pública:", error);
    process.exit(1);
}

export default PUBLIC_KEY;
