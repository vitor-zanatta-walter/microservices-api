from sqlalchemy import Column, Integer, String, TIMESTAMP, Text
from app.database import Base


class Event(Base):
    
    __tablename__ = "Events"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    starts_at = Column(TIMESTAMP, nullable=False)
    ends_at = Column(TIMESTAMP, nullable=False)
    finished = Column(Integer, nullable=False, default=0)  # Boolean stored as 0/1

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "location": self.location,
            "starts_at": self.starts_at.isoformat() if self.starts_at else None,
            "ends_at": self.ends_at.isoformat() if self.ends_at else None,
            "finished": bool(self.finished),
        }
