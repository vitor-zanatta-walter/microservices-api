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
            throw new Error(errorData.message || `Service returned ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error creating user:', error.message);
        throw error;
    }
}
