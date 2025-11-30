# Email Service using Gmail API

from app.services.gmail_client import GmailClient
from app.config import Config


class EmailService:
    # Service for sending emails via Gmail API
    
    def __init__(self):
        # Initialize Gmail API client
        self.client = GmailClient(
            credentials_file=Config.GMAIL_CREDENTIALS_FILE,
            token_file=Config.GMAIL_TOKEN_FILE
        )
    
    def send_email(self, to, subject, body):
        # Send plain text email
        
        # Args:
        #     to: Recipient email address (string or list)
        #     subject: Email subject
        #     body: Email body (plain text)
        
        # Returns:
        #     Message ID if successful
        
        return self.client.send_email(to, subject, body, html=False)
    
    def send_html_email(self, to, subject, html_body):
        # Send HTML email
        
        # Args:
        #     to: Recipient email address (string or list)
        #     subject: Email subject
        #     html_body: Email body (HTML)
        
        # Returns:
        #     Message ID if successful
        
        return self.client.send_email(to, subject, html_body, html=True)
