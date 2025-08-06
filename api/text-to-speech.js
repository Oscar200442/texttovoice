import { createClient } from '@supabase/supabase-js';
import { fetch } from 'node-fetch'; // Vercel har indbygget 'fetch'

// Initialiserer Supabase-klienten ved hjælp af Environment Variables fra Vercel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default async function (request, response) {
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    const { text, userToken } = request.body; // Vi antager, at vi modtager en userToken

    if (!elevenLabsApiKey) {
        return response.status(500).send("ElevenLabs API-nøgle mangler.");
    }
    if (!text || !userToken) {
        return response.status(400).send("Tekst eller bruger-token mangler.");
    }

    // 1. Valider brugerens token
    const { data: { user }, error: authError } = await supabase.auth.api.getUser(userToken);
    
    if (authError || !user) {
        return response.status(401).send("Ugyldig bruger-token. Log venligst ind igen.");
    }

    // 2. Tjek brugerens token-saldo
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', user.id)
        .single();

    if (userError || userData.tokens < 1) {
        return response.status(403).send("Du har ikke nok tokens. Venligst køb flere.");
    }

    // 3. Træk 1 token fra saldoen
    const newTokens = userData.tokens - 1;
    await supabase
        .from('users')
        .update({ tokens: newTokens })
        .eq('id', user.id);

    // 4. Send anmodning til ElevenLabs API
    try {
        const elevenLabsResponse = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00TzHpg1eYV1XnFgo', {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': elevenLabsApiKey,
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
