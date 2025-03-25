const app = document.getElementById("app");

function display404() {
    app.innerHTML = `
    <section class="friends">
        <header class="header">
        <div class="logo">ROGUE</div>
    </header>

    <!-- ERROR CONTENT -->
    <div class="error-container">
        <div class="error-code">404</div>
        <h1 class="error-message">Page Not Found</h1>
        <p class="error-description">
            Oops! The page you are looking for seems to have disappeared into the void.
            Don't worry, even the best rogues lose their way sometimes.
        </p>

        <!-- REASONS SECTION -->
        <div class="reasons-container">
            <h2 class="reasons-title">Possible Reasons:</h2>
            <ul class="reasons-list">
                <li>The URL may be misspelled or typed incorrectly</li>
                <li>You might not have permission to access this page</li>
            </ul>
        </div>

        <!-- HOME BUTTON -->
        <a href="#home" id="homeBtn" class="home-button btn">
                <i class="fas fa-home"></i> Return to Home
        </a>
    </div>
    </section>
    `;
    document.title = '404';

    const homeButton = document.getElementById('homeBtn');
    homeButton.addEventListener('click', () => {
        window.location.href = window.location.origin + '/#home';
    });
}


export default display404;
