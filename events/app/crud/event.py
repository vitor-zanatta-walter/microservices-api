# Operações CRUD para Event

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.event import Event
# Removed pydantic schema imports; functions now accept plain dicts


def get_event(db: Session, event_id: int) -> Optional[Event]:
    # Busca um evento por ID
    return db.query(Event).filter(Event.id == event_id).first()


def get_all_events(db: Session) -> List[Event]:
    # Busca todos os eventos
    return db.query(Event).all()


def create_event(db: Session, event_in: dict) -> Event:
    # Cria um novo evento
    db_event = Event(**event_in)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


def update_event(db: Session, event_id: int, event_in: dict) -> Optional[Event]:
    # Atualiza um evento existente
    db_event = get_event(db, event_id)
    if not db_event:
        return None
    
    update_data = event_in
    for field, value in update_data.items():
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    return db_event


def delete_event(db: Session, event_id: int) -> bool:
    # Deleta um evento
    db_event = get_event(db, event_id)
    if not db_event:
        return False
    
    db.delete(db_event)
    db.commit()
    return True
