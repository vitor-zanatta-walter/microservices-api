# Configurações da aplicação
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    # Application configuration
    
    # Application
    APP_NAME = os.getenv("APP_NAME", "Email Service")
    APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
    DEBUG = os.getenv("DEBUG", "True").lower() == "true"
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", "3004"))
    
    # Gmail API Configuration
    GMAIL_CREDENTIALS_FILE = os.getenv("GMAIL_CREDENTIALS_FILE", "credentials.json")
    GMAIL_TOKEN_FILE = os.getenv("GMAIL_TOKEN_FILE", "token.json")
    MAIL_USERNAME = os.getenv("MAIL_USERNAME", "")
