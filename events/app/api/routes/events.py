from flask import Blueprint, request, jsonify, abort
from app.database import get_db
from app.utils.validation import (
    validate_event_create,
    validate_event_update,
    ValidationError,
)
from app.crud import event as event_crud
from app.crud import certificate as certificate_crud
from app.auth.jwt_utils import require_attendant, extract_token_from_header
from app.services.enrollment_service import EnrollmentService
import hashlib
import datetime

bp = Blueprint("events", __name__, url_prefix="/events")

@bp.route("/", methods=["GET"])
def list_events():
    # Lista todos os eventos
    db = get_db()
    events = event_crud.get_all_events(db)
    return jsonify([e.to_dict() for e in events])

@bp.route("/<int:event_id>", methods=["GET"])
def get_event(event_id: int):
    # Busca um evento por ID
    db = get_db()
    ev = event_crud.get_event(db, event_id)
    if not ev:
        abort(404, description="Evento não encontrado")
    return jsonify(ev.to_dict())

@bp.route("/", methods=["POST"])
@require_attendant
def create_event():
    # Cria um novo evento
    db = get_db()
    event_in = request.get_json()
    if not event_in:
        abort(400, description="Payload inválido")
        
    try:
        clean = validate_event_create(event_in)
    except ValidationError as exc:
        abort(422, description=str(exc))
        
    new_event = event_crud.create_event(db, clean)
    return jsonify(new_event.to_dict()), 201

@bp.route("/<int:event_id>", methods=["PUT"])
@require_attendant
def update_event(event_id: int):
    # Atualiza um evento
    db = get_db()
    event_in = request.get_json()
    if not event_in:
        abort(400, description="Payload inválido")

    try:
        clean = validate_event_update(event_in)
    except ValidationError as exc:
        abort(422, description=str(exc))
        
    ev = event_crud.update_event(db, event_id, clean)
    if not ev:
        abort(404, description="Evento não encontrado")
    return jsonify(ev.to_dict())

@bp.route("/<int:event_id>", methods=["DELETE"])
@require_attendant
def delete_event(event_id: int):
    # Deleta um evento
    db = get_db()
    if not event_crud.delete_event(db, event_id):
        abort(404, description="Evento não encontrado")
    return "", 204

@bp.route("/<int:event_id>/finish", methods=["POST"])
@require_attendant
def finish_event(event_id: int):
    # Finaliza evento e gera certificados
    db = get_db()
    
    # 1. Verificar se evento existe
    ev = event_crud.get_event(db, event_id)
    if not ev:
        abort(404, description="Evento não encontrado")
    
    # 2. Marcar evento como finalizado
    event_crud.update_event(db, event_id, {"finished": True})
        
    # 3. Buscar token do header para repassar
    auth_header = request.headers.get("Authorization")
    token = extract_token_from_header(auth_header)
    
    # 4. Buscar inscrições com presença
    try:
        attended_enrollments = EnrollmentService.get_attended_enrollments(event_id, token)
    except Exception as e:
        abort(502, description=str(e))
        
    generated_count = 0
    
    # 4. Gerar certificados
    for enrollment in attended_enrollments:
        user_id = enrollment.get("user_id")
        
        if not user_id:
            continue
            
        # Gerar Hash Único
        # Hash = SHA256(user_id + event_id + secret_salt + timestamp)
        raw_string = f"{user_id}:{event_id}:SECRET_SALT:{datetime.datetime.now().isoformat()}"
        cert_hash = hashlib.sha256(raw_string.encode()).hexdigest()
        
        cert_data = {
            "user_id": user_id,
            "event_id": event_id,
            "hash": cert_hash
        }
        
        try:
            certificate_crud.create_certificate(db, cert_data)
            generated_count += 1
        except Exception:
            # Provavelmente já existe (Unique Constraint no user_id + event_id)
            # Ignorar silenciosamente
            db.rollback()
            continue
            
    return jsonify({
        "message": "Processo de finalização concluído",
        "event_id": event_id,
        "certificates_generated": generated_count,
        "total_attended": len(attended_enrollments)
    })
