# Configuração do banco de dados usando SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import DATABASE_URL

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


from flask import g

def get_db():
    # Obtém a sessão do banco de dados do contexto da requisição
    if 'db' not in g:
        g.db = SessionLocal()
    return g.db

def close_db(e=None):
    # Fecha a sessão do banco de dados ao final da requisição
    db = g.pop('db', None)
    if db is not None:
        db.close()
