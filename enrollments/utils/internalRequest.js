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
