# Models para Certificate
from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKeyConstraint
from sqlalchemy.sql import func
from app.database import Base


class Certificate(Base):
    
    __tablename__ = "Certificates"

    user_id = Column(Integer, nullable=False)
    event_id = Column(Integer, nullable=False)
    hash = Column(String(255), primary_key=True, nullable=False)
    issued_at = Column(TIMESTAMP, nullable=False, server_default=func.current_timestamp())

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "event_id": self.event_id,
            "hash": self.hash,
            "issued_at": self.issued_at.isoformat() if self.issued_at else None,
        }
