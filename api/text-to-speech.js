// Denne kode bruger den globale 'fetch' funktion
// og kræver derfor ikke en 'package.json' fil

export default async function (request, response) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const { text } = request.body;

    if (!apiKey) {
        return response.status(500).send("ElevenLabs API-nøgle mangler.");
    }
    if (!text) {
        return response.status(400).send("Tekst mangler.");
    }

    try {
        const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00TzHpg1eYV1XnFgo', {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': apiKey,
            },
            body: JSON.stringify({
                text: text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            }),
        });

        if (!elevenLabsResponse.ok) {
            const errorText = await elevenLabsResponse.text();
            console.error("ElevenLabs API Fejl:", errorText);
            return response.status(elevenLabsResponse.status).send(`ElevenLabs fejl: ${errorText}`);
        }

        const audioBuffer = await elevenLabsResponse.arrayBuffer();
        response.setHeader('Content-Type', 'audio/mpeg');
        response.status(200).send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error("Serverfejl:", error);
        return response.status(500).send("En ukendt fejl opstod på serveren.");
    }
}
