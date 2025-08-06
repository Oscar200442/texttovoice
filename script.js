const SUPABASE_URL = 'https://czocthrzbtoaudyerssg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6b2N0aHJ6YnRvYXVkeWVyc3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTM5OTEsImV4cCI6MjA3MDA4OTk5MX0.WjPmaEZ-u1Ncoll_Xb_TwLH7nUTn06gBCY0709472X8';

const supabase = Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authForm = document.getElementById('auth-form');
const loginForm = document.getElementById('login-form');
const signupButton = document.getElementById('signup-button');
const logoutButton = document.getElementById('logout-button');
const appContainer = document.getElementById('app-container');
const tokenCount = document.getElementById('token-count');
const speakButton = document.getElementById('speak-button');
const textInput = document.getElementById('text-input');
const audioOutput = document.getElementById('audio-output');
const statusMessage = document.getElementById('status-message');

async function updateUI() {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        authForm.style.display = 'none';
        appContainer.style.display = 'block';
        await fetchUserTokens(user.id);
    } else {
        authForm.style.display = 'block';
        appContainer.style.display = 'none';
    }
}

async function fetchUserTokens(userId) {
    const { data, error } = await supabase
        .from('users')
        .select('tokens')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Fejl ved hentning af tokens:', error);
        tokenCount.textContent = 'Fejl';
    } else {
        tokenCount.textContent = data.tokens;
    }
}

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert(error.message);
    } else {
        updateUI();
    }
});

signupButton.addEventListener('click', async () => {
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) {
        alert(error.message);
    } else {
        alert('Bruger oprettet! Tjek din e-mail for at bekræfte.');
    }
});

logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
    updateUI();
});

speakButton.addEventListener('click', async () => {
    const text = textInput.value;
    if (text === '') return;

    speakButton.disabled = true;
    statusMessage.textContent = 'Genererer tale...';
    statusMessage.classList.remove('error');
    audioOutput.src = '';
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        statusMessage.textContent = 'Du skal være logget ind.';
        statusMessage.classList.add('error');
        speakButton.disabled = false;
        return;
    }

    try {
        const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ text })
        });

        if (response.ok) {
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            audioOutput.src = audioUrl;
            statusMessage.textContent = 'Færdig!';
            audioOutput.play();
            await fetchUserTokens(session.user.id);
        } else {
            const errorText = await response.text();
            statusMessage.textContent = `Fejl: ${errorText}`;
            statusMessage.classList.add('error');
        }
    } catch (error) {
        console.error("Frontend Fejl:", error);
        statusMessage.textContent = 'En netværksfejl opstod.';
        statusMessage.classList.add('error');
    } finally {
        speakButton.disabled = false;
    }
});

supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
        if (session) {
            supabase.from('users').insert({ id: session.user.id, email: session.user.email, tokens: 500 }).then(({ data, error }) => {
                if (error) {
                    console.error('Fejl ved oprettelse af bruger i database:', error);
                } else {
                    console.log('Bruger oprettet i database:', data);
                }
            });
        }
    }
    updateUI();
});
updateUI();
