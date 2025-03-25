import { getCookieValue } from "../jsUtils/auth.js";

const app = document.getElementById("app");

const template = `
<div class="login-container">
<div class="auth-container">
<div class="signup-side">
    <h2 class="welcome-message">Welcome to PONG</h2>
    <p>Create an account and start your game</p>
    <button class="signup-btn">Sign Up</button>
</div>
<div class="signin-side">
    <form id="signin-form" class="form-container">
        <input type="email" id="signin-email" placeholder="Email" required>
        <input type="password" id="signin-password" placeholder="Password" required>
        <button type="submit" class="submit-btn" disabled>Sign In</button>
        <div class="error-message1"></div>
        <div class="alternative-signup">
            <button type="button" class="alternative-btn intra-btn">42 Intra</button>
        </div>
    </form>
    <form id="signup-form" class="form-container hidden">
        <input type="text" id="fullname" placeholder="Full Name" required>
        <input type="text" id="username" placeholder="Username" required>
        <input type="email" id="email" placeholder="Email" required>
        <input type="password" id="password" placeholder="Password" required>
        <button type="submit" class="submit-btn" disabled>Create Account</button>
        <div class="error-message2"></div>
        <div class="alternative-signup">
            <button type="button" class="alternative-btn intra-btn">42 Intra</button>
        </div>
    </form>
</div>
</div>
</div>
`;

function setupLogin() {
    const container = document.querySelector('.auth-container');
    const signupBtn = document.querySelector('.signup-btn');
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    const errorMessage1 = document.querySelector('.error-message1');
    const errorMessage2 = document.querySelector('.error-message2');


    // Toggle between sign in and sign up
    signupBtn.addEventListener('click', () => {
        container.classList.toggle('swap');
        signinForm.classList.toggle('hidden');
        signupForm.classList.toggle('hidden');
        // Change button text
        signupBtn.textContent = signupBtn.textContent === 'Sign Up' ? 'Sign In' : 'Sign Up';
    });
    
    // Form validation for signin
    const signinEmail = document.getElementById('signin-email');
    const signinPassword = document.getElementById('signin-password');
    const signinSubmitBtn = signinForm.querySelector('.submit-btn');
    
    function validateSigninForm() {
        const isValid = signinEmail.value.trim() !== '' && signinPassword.value.trim() !== '';
        signinSubmitBtn.disabled = !isValid;
    }
    
    [signinEmail, signinPassword].forEach(input => {
        input.addEventListener('input', validateSigninForm);
    });
    // Form validation for signup
    const signupInputs = signupForm.querySelectorAll('input');
    const signupSubmitBtn = signupForm.querySelector('.submit-btn');
    
    function validateSignupForm() {
        const isValid = Array.from(signupInputs).every(input => input.value.trim() !== '');
        signupSubmitBtn.disabled = !isValid;
    }
    
    signupInputs.forEach(input => {
        input.addEventListener('input', validateSignupForm);
    });
    
    // Function to send data

    async function sendData(url, data) {
        try {
            const response = await fetch(`/api/${url}/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            console.log(data);
            
            const result = await response.json();
            console.log("HERERTERYTF ", result.message);
            if (!response.ok) {
                // Instead of throwing a new error with hardcoded message,
                // return the actual error from the server
                return { ok: false, detail: result.message};
            }
            return { ok: response.ok, ...result };
        } catch (error) {
            console.log('Error:', error);
            return { ok: false, detail: 'Network or parsing error occurred' };
        }
    }
    
    // Form submission handlers
    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            email: signinEmail.value.trim(),
            password: signinPassword.value.trim()
        };
        
        const result = await sendData('login', userData);
        if (result.ok) {
            setTimeout(() => {
                console.log("Before navigation, access_token exists:", getCookieValue('access_token') !== null);
                window.location.hash = 'home';
            }, 250);

        } else {
            errorMessage1.textContent = result.detail || 'Invalid credentials!';
            errorMessage1.style.display = 'block';
        }
    });
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
            full_name: document.getElementById('fullname').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value.trim(),
        };
        
        const result = await sendData('signup', userData);
        console.log("signup response:", result.message);
        if (result.ok) {
            window.location.hash = 'home';
            // alert('Account created successfully!');
        } else {
            errorMessage2.textContent = 'Invalid input!';
            errorMessage2.style.display = 'block';
        }
    });
    
    // 42 intra
    async function handleIntraAuth() {
        try {
            const response = await fetch('/api/oauth2/authorize');
            
            // if (!response.ok) {
            //     throw new Error('Failed to get authorization URL');
            // }
            
            const data = await response.json();
            console.log('Authorization URL:', data.url);
            
            window.location.href = data.url;
            
            
        } catch (error) {
            console.error('Intra authentication error:', error);
            errorMessage.textContent = 'Failed to connect to 42 Intra. Please try again later.';
            errorMessage.style.display = 'block';
        }
    }
    const authIntra = document.querySelector('.alternative-btn.intra-btn');

    authIntra.addEventListener('click', (e) => {
        e.preventDefault();
        handleIntraAuth();
    });
}
    //     async function handleIntraAuth() {
//         try {
//             const response = await fetch('/api/oauth2/authorize');
            
//             // if (!response.ok) {
//             //     throw new Error('Failed to get authorization URL');
//             // }
            
//             const data = await response.json();
//             console.log('Authorization URL:', data.url);
            
//             window.location.href = data.url;
            
            
//         } catch (error) {
//             console.error('Intra authentication error:', error);
//             errorMessage.textContent = 'Failed to connect to 42 Intra. Please try again later.';
//             errorMessage.style.display = 'block';
//         }
//     }
//     const authIntra = document.querySelector('.alternative-btn.intra-btn');

//     authIntra.addEventListener('click', (e) => {
//         e.preventDefault();
//         handleIntraAuth();
//     });
// }

function displayAuth() {
    // document.getElementById("header").style.visibility = "hidden";
    app.innerHTML = template;
    document.title = 'Login';
    setupLogin();
}

export default displayAuth;