// ... (previous code remains the same until signupButton)

// Signup logic
signupButton.addEventListener('click', async () => {
    const email = loginForm.email.value;
    const password = loginForm.password.value;
    if (!email || !password) {
        alert('Please enter both email and password.');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error('Signup error:', error);
            alert(`Registration failed: ${error.message}`);
        } else if (data.user) {
            console.log('Signup success, user data:', data.user);
            // Insert user into custom users table with initial tokens
            const { error: insertError } = await supabase
                .from('users')
                .insert({ id: data.user.id, email: data.user.email, tokens: 500 });
            if (insertError) {
                console.error('Insert error:', insertError);
                alert('Registration succeeded, but user data save failed. Contact support.');
            } else {
                console.log('User inserted into users table');
                alert('User created! Check your email to confirm.');
            }
        }
    } catch (e) {
        console.error('Unexpected error during signup:', e);
        alert('An unexpected error occurred. Check console.');
    }
});

// ... (rest of the code remains the same)
