# Aplicação principal Flask
from flask import Flask, jsonify, g, request
from werkzeug.exceptions import HTTPException
from app.config import APP_NAME, APP_VERSION
from app.api.router import bp as api_bp
from app.auth.jwt_utils import extract_token_from_header, decode_jwt_token

from flask_cors import CORS

# Criar aplicação Flask
app = Flask(__name__)
CORS(app)

# Registrar Blueprints
app.register_blueprint(api_bp)

# Middleware de Autenticação (before_request)
@app.before_request
def authenticate_request():
    # Ignorar autenticação para rotas públicas (root, health, ping)
    # e para requisições OPTIONS (CORS preflight)
    if request.method == 'OPTIONS':
        return
        
    public_endpoints = ['root', 'ping', 'health_check']
    if request.endpoint in public_endpoints:
        return

    # Tentar extrair e validar token
    auth_header = request.headers.get("Authorization")
    if auth_header:
        try:
            token = extract_token_from_header(auth_header)
            user = decode_jwt_token(token)
            g.user = user
        except Exception as e:
            # Logar o erro para debug
            print(f"Auth Error: {e}")
            # Se falhar, g.user não será definido.
            pass

# Tratamento de Erros Global
@app.errorhandler(HTTPException)
def handle_exception(e):
    response = e.get_response()
    response.data = jsonify({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    }).data
    response.content_type = "application/json"
    return response

@app.route("/", methods=["GET"])
def root():
    # Endpoint raiz da API
    return jsonify({
        "message": f"Bem-vindo à {APP_NAME}",
        "version": APP_VERSION
    })

@app.route("/ping", methods=["GET"])
def ping():
    # Endpoint de ping
    return jsonify({"message": "pong"})

@app.route("/health", methods=["GET"])
def health_check():
    # Endpoint de health check
    return jsonify({
        "status": "healthy",
        "app": APP_NAME,
        "version": APP_VERSION
    })
