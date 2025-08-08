// Import the necessary libraries
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Buffer } from 'buffer';

export default async (req, res) => {
    // Make sure it's a POST request
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    // Check if text was sent
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }
    
    // Get the API key from environment variables
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

    try {
        // Create a client for Google Text-to-Speech
        const client = new TextToSpeechClient({
            key: GOOGLE_API_KEY // Use the API key here
        });

        // Configure the API request
        const request = {
            input: { text: text },
            // Choose the voice: Danish (da-DK) and a neutral gender
            voice: { languageCode: 'da-DK', ssmlGender: 'NEUTRAL' },
            // Choose the output format as MP3
            audioConfig: { audioEncoding: 'MP3' },
        };

        // Send the request to the Google Cloud Text-to-Speech API
        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent;

        // Set the header to tell the browser it's an audio file
        res.setHeader('Content-Type', 'audio/mpeg');
        // Send the audio back as a buffer
        res.status(200).send(Buffer.from(audioContent));
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to generate speech' });
    }
};
