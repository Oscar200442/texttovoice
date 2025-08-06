const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://czocthrzbtoaudyerssg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check token balance
    const { data, error } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

    if (error || !data || data.tokens < 1) {
        return res.status(403).json({ error: 'Insufficient tokens' });
    }

    // Deduct token
    const { error: updateError } = await supabase
        .from('users')
        .update({ tokens: data.tokens - 1 })
        .eq('id', user.id);

    if (updateError) {
        return res.status(500).json({ error: 'Failed to update tokens' });
    }

    // Placeholder for text-to-speech API
    try {
        // Replace with your actual TTS API call, e.g., ElevenLabs or Google Cloud TTS
        // Example: const response = await fetch('https://your-tts-api.com/synthesize', { ... });
        // const audioBuffer = await response.buffer();
        // res.setHeader('Content-Type', 'audio/mpeg');
        // res.status(200).send(audioBuffer);
        res.status(200).json({ message: 'Mock audio response - replace with TTS API' });
    } catch (error) {
        res.status(500).json({ error: 'Text-to-speech generation failed' });
    }
};
