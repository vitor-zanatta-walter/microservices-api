"""
Gmail API Client Wrapper
Handles OAuth2 authentication and email sending via Gmail API
"""
import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

# Gmail API scopes
SCOPES = ['https://www.googleapis.com/auth/gmail.send']


class GmailClient:
    """Gmail API client for sending emails"""
    
    def __init__(self, credentials_file, token_file):
        """
        Initialize Gmail client
        
        Args:
            credentials_file: Path to OAuth2 credentials JSON file
            token_file: Path to store/load refresh token
        """
        self.credentials_file = credentials_file
        self.token_file = token_file
        self.service = None
        self._authenticate()
    
    def _authenticate(self):
        """Authenticate with Gmail API using OAuth2"""
        creds = None
        
        # Load existing token if available
        if os.path.exists(self.token_file):
            creds = Credentials.from_authorized_user_file(self.token_file, SCOPES)
        
        # If no valid credentials, authenticate
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                # Refresh expired token
                creds.refresh(Request())
            else:
                # Run OAuth2 flow for first-time authentication
                flow = InstalledAppFlow.from_client_secrets_file(
                    self.credentials_file, SCOPES
                )
                creds = flow.run_local_server(port=0)
            
            # Save credentials for future use
            with open(self.token_file, 'w') as token:
                token.write(creds.to_json())
        
        # Build Gmail service
        self.service = build('gmail', 'v1', credentials=creds)
    
    def send_email(self, to, subject, body, html=False):
        """
        Send email via Gmail API
        
        Args:
            to: Recipient email address (string or list)
            subject: Email subject
            body: Email body content
            html: Whether body is HTML (default: False)
        
        Returns:
            Message ID if successful
        
        Raises:
            HttpError: If Gmail API request fails
        """
        try:
            # Create message
            message = MIMEMultipart('alternative') if html else MIMEText(body)
            
            if isinstance(to, list):
                message['To'] = ', '.join(to)
            else:
                message['To'] = to
            
            message['Subject'] = subject
            
            # Add body for HTML emails
            if html:
                text_part = MIMEText(body, 'plain')
                html_part = MIMEText(body, 'html')
                message.attach(text_part)
                message.attach(html_part)
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')
            
            # Send via Gmail API
            send_message = self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            return send_message['id']
        
        except HttpError as error:
            raise Exception(f'Gmail API error: {error}')
