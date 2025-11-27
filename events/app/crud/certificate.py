"""
Operações CRUD para Certificate
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.certificate import Certificate
# Removed pydantic schema imports; functions now accept plain dicts


def get_certificate(db: Session, hash: str) -> Optional[Certificate]:
    # Busca um certificado por Hash (PK)
    return db.query(Certificate).filter(Certificate.hash == hash).first()


def get_all_certificates(db: Session) -> List[Certificate]:
    # Busca todos os certificados
    return db.query(Certificate).all()


def get_certificate_by_hash(db: Session, hash: str) -> Optional[Certificate]:
    # Busca certificado por hash (para verificação)
    return db.query(Certificate).filter(Certificate.hash == hash).first()


def get_certificates_by_user_id(db: Session, user_id: int) -> List[Certificate]:
    # Busca todos os certificados de um usuário
    return db.query(Certificate).filter(Certificate.user_id == user_id).all()


def create_certificate(db: Session, certificate_in: dict) -> Certificate:
    # Cria um novo certificado
    db_certificate = Certificate(**certificate_in)
    db.add(db_certificate)
    db.commit()
    db.refresh(db_certificate)
    return db_certificate


def update_certificate(db: Session, hash: str, certificate_in: dict) -> Optional[Certificate]:
    # Atualiza um certificado existente
    db_certificate = get_certificate(db, hash)
    if not db_certificate:
        return None
    
    update_data = certificate_in
    for field, value in update_data.items():
        setattr(db_certificate, field, value)
    
    db.commit()
    db.refresh(db_certificate)
    return db_certificate


def delete_certificate(db: Session, hash: str) -> bool:
    # Deleta um certificado
    db_certificate = get_certificate(db, hash)
    if not db_certificate:
        return False
    
    db.delete(db_certificate)
    db.commit()
    return True
