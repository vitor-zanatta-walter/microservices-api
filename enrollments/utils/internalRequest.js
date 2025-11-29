export async function getEvent(eventId, token) {
    const serviceUrl = process.env.EVENTS_SERVICE_URL;

    if (!serviceUrl) {
        console.warn('EVENTS_SERVICE_URL not defined, skipping event validation');
        return null;
    }

    try {
        const response = await fetch(`${serviceUrl}/${eventId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error getting event:', error.message);
        throw new Error('Não foi possível validar o evento no momento.');
    }
}

export async function getUserByEmail(email, token) {
    const serviceUrl = process.env.USER_SERVICE_URL;

    if (!serviceUrl) {
        console.warn('USER_SERVICE_URL not defined');
        return null;
    }

    try {
        const response = await fetch(`${serviceUrl}/email/${email}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 404) {
            return null;
        }

        if (!response.ok) {
            throw new Error(`Service returned ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error getting user by email:', error.message);
        throw new Error('Não foi possível validar o usuário no momento.');
    }
}

export async function createUser(userData) {
    const serviceUrl = process.env.USER_SERVICE_URL;

    if (!serviceUrl) {
        console.warn('USER_SERVICE_URL not defined');
        return null;
    }

    try {
        const response = await fetch(`${serviceUrl}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Error creating user:', response.status, errorData);
            throw new Error(errorData.message || `Service returned ${response.status}`);
        }

        const result = await response.json();
        console.log('User created successfully:', result);
        return result;
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}

export async function sendWelcomeEmail(userEmail, userName, password, eventName, token) {
    const serviceUrl = process.env.EMAIL_SERVICE_URL;

    if (!serviceUrl) {
        console.warn('EMAIL_SERVICE_URL not defined, skipping email notification');
        return false;
    }

    try {
        const emailBody = `
            <h2>Bem-vindo ao Sistema de Eventos!</h2>
            <p>Olá, <strong>${userName}</strong>!</p>
            <p>Sua conta foi criada automaticamente durante o check-in no evento <strong>${eventName}</strong>.</p>
            <h3>Suas credenciais de acesso:</h3>
            <ul>
                <li><strong>Email:</strong> ${userEmail}</li>
                <li><strong>Senha temporária:</strong> ${password}</li>
            </ul>
            <p>Por favor, faça login no sistema e altere sua senha assim que possível.</p>
            <p>Atenciosamente,<br>Equipe de Eventos</p>
        `;

        const response = await fetch(`${serviceUrl}/api/email/send-html`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: userEmail,
                subject: `Bem-vindo! Sua conta foi criada - ${eventName}`,
                html_body: emailBody
            })
        });

        if (!response.ok) {
            console.error(`Failed to send email to ${userEmail}: ${response.status}`);
            return false;
        }

        console.log(`Welcome email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('Error sending welcome email:', error.message);
        return false;
    }
}
