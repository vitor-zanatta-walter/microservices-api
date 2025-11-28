from flask import Blueprint, request, jsonify
from app.services.email_service import EmailService
from app.auth.jwt_utils import get_current_user, require_attendant

bp = Blueprint("email", __name__)

@bp.route("/send", methods=["POST"])
@require_attendant
def send_email():
    """
    Envia um email simples (texto).
    Requer autenticação e privilégios de atendente.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
        
    to_email = data.get("to")
    subject = data.get("subject")
    body = data.get("body")
    
    if not all([to_email, subject, body]):
        return jsonify({"error": "Campos obrigatórios: to, subject, body"}), 400
        
    try:
        EmailService.send_email(to_email, subject, body, is_html=False)
        return jsonify({"message": "Email enviado com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@bp.route("/send-html", methods=["POST"])
@require_attendant
def send_email_html():
    """
    Envia um email HTML.
    Requer autenticação e privilégios de atendente.
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Dados inválidos"}), 400
        
    to_email = data.get("to")
    subject = data.get("subject")
    body = data.get("body")
    
    if not all([to_email, subject, body]):
        return jsonify({"error": "Campos obrigatórios: to, subject, body"}), 400
        
    try:
        EmailService.send_email(to_email, subject, body, is_html=True)
        return jsonify({"message": "Email HTML enviado com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
