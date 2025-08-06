export default async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    const VOICE_ID = 'kdmDKE6EkgrWrrykO9Qt';
    const API_URL = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'xi-api-key': ELEVENLABS_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.8,
                    similarity_boost: 0.6
                }
            })
        });

        if (!response.ok) {
            throw new Error('Failed to generate speech');
        }

        const audioBlob = await response.blob();
        res.setHeader('Content-Type', 'audio/mpeg');
        res.status(200).send(Buffer.from(await audioBlob.arrayBuffer()));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
};
