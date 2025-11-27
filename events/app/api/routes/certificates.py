from flask import Blueprint, jsonify, abort, request

from app.database import get_db
from app.crud import certificate as certificate_crud
from app.auth.jwt_utils import get_current_user, extract_token_from_header, decode_jwt_token

bp = Blueprint("certificates", __name__, url_prefix="/certificates")



@bp.route("/me", methods=["GET"])
def get_my_certificates():
    # Busca certificados do usuário autenticado
    auth_header = request.headers.get("Authorization")
    token = extract_token_from_header(auth_header)
    user = decode_jwt_token(token)
    
    db = get_db()
    certs = certificate_crud.get_certificates_by_user_id(db, int(user.sub))
    return jsonify([c.to_dict() for c in certs])



@bp.route("/verify/<string:hash>", methods=["GET"])
def verify_certificate(hash: str):
    # Verifica certificado por hash
    db = get_db()
    certificate = certificate_crud.get_certificate_by_hash(db, hash)
    if not certificate:
        abort(404, description="Certificado não encontrado")
    return jsonify(certificate.to_dict())
