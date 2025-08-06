document.addEventListener('DOMContentLoaded', () => {
    // Supabase configuration
    const SUPABASE_URL = 'https://czocthrzbtoaudyerssg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6b2N0aHJ6YnRvYXVkeWVyc3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1M';

    // Check if Supabase library is loaded
    if (!window.Supabase) {
        console.error('Supabase library not loaded. Please check the CDN script in index.html.');
        document.getElementById('status-message').textContent = 'Error: Supabase library failed to load.';
        return;
    }

    // Initialize Supabase client
    const supabase = window.Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // UI Elements
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

    // Function to update UI
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

    // Fetch user's token balance
    async function fetchUserTokens(userId) {
        const { data, error } = await supabase
            .from('users')
            .select('tokens')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching tokens:', error);
            tokenCount.textContent = 'Error';
        } else {
            tokenCount.textContent = data.tokens;
        }
    }

    // Login logic
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
        } else {
            await updateUI();
        }
    });

    // Signup logic
    signupButton.addEventListener('click', async () => {
        const email = loginForm.email.value;
        const password = loginForm.password.value;
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert(error.message);
        } else {
            alert('User created! Check your email to confirm.');
        }
    });

    // Logout logic
    logoutButton.addEventListener('click', async () => {
        await supabase.auth.signOut();
        await updateUI();
    });

    // Text-to-speech logic
    speakButton.addEventListener('click', async () => {
        const text = textInput.value;
        if (text === '') return;

        speakButton.disabled = true;
        statusMessage.textContent = 'Generating speech...';
        statusMessage.classList.remove('error');
        audioOutput.src = '';

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            statusMessage.textContent = 'You must be logged in.';
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
                statusMessage.textContent = 'Done!';
                audioOutput.play();
                await fetchUserTokens(session.user.id);
            } else {
                const errorText = await response.text();
                statusMessage.textContent = `Error: ${errorText}`;
                statusMessage.classList.add('error');
            }
        } catch (error) {
            console.error('Frontend Error:', error);
            statusMessage.textContent = 'A network error occurred.';
            statusMessage.classList.add('error');
        } finally {
            speakButton.disabled = false;
        }
    });

    // Initialize on auth state change
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session) {
            supabase.from('users').insert({ id: session.user.id, email: session.user.email, tokens: 500 })
                .then(({ error, data }) => {
                    if (error) {
                        console.error('Error creating user in database:', error);
                    } else {
                        console.log('User created in database:', data);
                    }
                });
        }
        updateUI();
    });

    // Initial UI update
    updateUI();
});
