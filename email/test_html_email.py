import os
from app.services.gmail_client import GmailClient
from app.config import Config

# Mock config if needed, or rely on env vars being set
# Assuming running in environment where .env is loaded or vars are set
# For local test, we might need to load .env manually if not running via Flask

from dotenv import load_dotenv
load_dotenv()

def test_send_html():
    print("Initializing GmailClient...")
    try:
        client = GmailClient(
            credentials_file=os.getenv("GMAIL_CREDENTIALS_FILE", "credentials.json"),
            token_file=os.getenv("GMAIL_TOKEN_FILE", "token.json")
        )
        
        to_email = "nadinewolfart@gmail.com" # Using the email from user logs
        subject = "Teste Email HTML Direto"
        html_body = """
        <h1>Teste de Email HTML</h1>
        <p>Este é um <strong>teste direto</strong> do script Python.</p>
        <p>Verifique se este email chega com formatação.</p>
        """
        
        print(f"Sending HTML email to {to_email}...")
        message_id = client.send_email(to_email, subject, html_body, html=True)
        print(f"Success! Message ID: {message_id}")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_send_html()
