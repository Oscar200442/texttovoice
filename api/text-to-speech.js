import { fetch } from 'node-fetch'; // Vercel understøtter 'node-fetch' ud af boksen

export default async function (request, response) {
    const apiKey = process.env.OPENAI_API_KEY;
    const { text } = request.body;

    if (!apiKey) {
        return response.status(500).send("API-nøgle mangler.");
    }
    if (!text) {
        return response.status(400).send("Tekst mangler.");
    }

    try {
        const openaiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: "tts-1",
                voice: "alloy",
                input: text,
            }),
        });

        if (!openaiResponse.ok) {
            const errorText = await openaiResponse.text();
            console.error("OpenAI API Fejl:", errorText);
            return response.status(openaiResponse.status).send(`OpenAI fejl: ${errorText}`);
        }

        const audioBuffer = await openaiResponse.buffer();
        response.setHeader('Content-Type', 'audio/mpeg');
        response.status(200).send(audioBuffer);

    } catch (error) {
        console.error("Serverfejl:", error);
        return response.status(500).send("En ukendt fejl opstod på serveren.");
    }
}
