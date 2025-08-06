document.addEventListener('DOMContentLoaded', () => {
    const textInput = document.getElementById('text-input');
    const speakButton = document.getElementById('speak-button');
    const audioOutput = document.getElementById('audio-output');
    const statusMessage = document.getElementById('status-message');

    speakButton.addEventListener('click', async () => {
        const text = textInput.value.trim();
        if (!text) {
            statusMessage.textContent = 'Please enter some text.';
            return;
        }

        speakButton.disabled = true;
        statusMessage.textContent = 'Generating speech...';

        try {
            const response = await fetch('/api/text-to-speech', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
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
