import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import MAIL_SERVER, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_DEFAULT_SENDER

class EmailService:
    @staticmethod
    def send_email(to_email, subject, body, is_html=False):
        """
        Envia um email usando Gmail SMTP
        """
        if not MAIL_USERNAME or not MAIL_PASSWORD:
            raise ValueError("Credenciais de email não configuradas")

        msg = MIMEMultipart()
        msg['From'] = MAIL_DEFAULT_SENDER
        msg['To'] = to_email
        msg['Subject'] = subject

        if is_html:
            msg.attach(MIMEText(body, 'html'))
        else:
            msg.attach(MIMEText(body, 'plain'))

        try:
            server = smtplib.SMTP(MAIL_SERVER, MAIL_PORT)
            server.starttls()
            server.login(MAIL_USERNAME, MAIL_PASSWORD)
            text = msg.as_string()
            server.sendmail(MAIL_DEFAULT_SENDER, to_email, text)
            server.quit()
            return True
        except Exception as e:
            print(f"Erro ao enviar email: {e}")
            raise e
