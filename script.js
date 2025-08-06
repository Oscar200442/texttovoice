document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const speakButton = document.getElementById('speak-button');
    const audioOutput = document.getElementById('audio-output');
    const statusMessage = document.getElementById('status-message');

    const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY'; // Replace with your API key
    const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Example voice ID (e.g., Rachel)
    const API_URL = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID;

    speakButton.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            statusMessage.textContent = 'Please enter some text.';
            return;
        }

        speakButton.disabled = true;
        statusMessage.textContent = 'Generating speech...';

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'xi-api-key': ELEVENLABS_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    text: text,
                    model_id: 'eleven_multilingual_v2', // High-quality multilingual model
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.75
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to generate speech');
            }

            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioOutput.src = audioUrl;
            audioOutput.play();
            statusMessage.textContent = 'Done!';
        } catch (error) {
            console.error('Error:', error);
            statusMessage.textContent = 'Error generating speech. Check console.';
        } finally {
            speakButton.disabled = false;
        }
    });
});
