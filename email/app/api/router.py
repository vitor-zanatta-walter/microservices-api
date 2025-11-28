from flask import Blueprint
from app.api.routes.email import bp as email_bp

bp = Blueprint("api", __name__)

bp.register_blueprint(email_bp)
