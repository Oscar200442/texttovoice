document.addEventListener('DOMContentLoaded', () => {
    // Supabase configuration
    const SUPABASE_URL = 'https://czocthrzbtoaudyerssg.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6b2N0aHJ6YnRvYXVkeWVyc3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1M';

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

    // Default fallback: Show auth form if Supabase fails
    if (!window.Supabase) {
        console.error('Supabase library not loaded. Displaying fallback UI.');
        authForm.style.display = 'block';
        statusMessage.textContent = 'Supabase unavailable. Login/signup may not work.';
        return;
    }

    // Initialize Supabase client
    const supabase = window.Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
   
