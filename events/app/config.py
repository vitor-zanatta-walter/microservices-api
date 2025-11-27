# Configurações da aplicação
import os
from dotenv import load_dotenv

load_dotenv()

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# Application
APP_NAME = os.getenv("APP_NAME", "Events API")
APP_VERSION = os.getenv("APP_VERSION", "1.0.0")
DEBUG = os.getenv("DEBUG", "True").lower() == "true"
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
ENROLLMENTS_SERVICE_URL = os.getenv("ENROLLMENTS_SERVICE_URL", "http://localhost:3002")
