import appendHeader from "/static/jsUtils/header.js";
import { getCookieValue } from "/static/jsUtils/auth.js";


export function isAuthenticated() {
    const token = getCookieValue('access_token');
    console.log("Checking authentication, token:", token ? 'exists' : 'missing');
    return token !== null;
}

// CSS loader function
function loadCSS(filename) {
    // Check if the CSS is already loaded
    const existingLinks = document.querySelectorAll('link[rel="stylesheet"]');
    for (let link of existingLinks) {
        if (link.href.includes(filename)) {
            return; // CSS already loaded
        }
    }
    
    const cssLink = document.createElement("link");
    cssLink.rel = "stylesheet";
    cssLink.href = filename;
    document.head.appendChild(cssLink);
}

// Load base CSS that should always be available
loadCSS("/static/styles.css");

// Define route configurations for better scalability
const routes = {
    'home': {
        loadModule: () => import("/static/home/home.js").then(module => {
            loadCSS("/static/home/home.css");
            return module.default;
        }),
        requiresAuth: true
    },
    'login': {
        loadModule: () => import("/static/login/login.js").then(module => {
            loadCSS("/static/login/login.css");
            return module.default;
        }),
        requiresAuth: false
    },
    'profile': {
        loadModule: () => import("/static/profile/profile.js").then(module => {
            loadCSS("/static/profile/profile.css");
            return module.default;
        }),
        requiresAuth: true
    },
    'game-1': {
        loadModule: () => import("/static/game-1/game.js").then(module => {
            loadCSS("/static/game-1/game.css");
            return module.default;
        }),
        requiresAuth: true
    },
    'friends': {
        loadModule: () => import("/static/friends/friends.js").then(module => {
            loadCSS("/static/friends/friends.css");
            return module.default;
        }),
        requiresAuth: true
    },
    '404': {
        loadModule: () => import("/static/404/404.js").then(module => {
            loadCSS("/static/404/404.css");
            return module.default;
        }),
        requiresAuth: false
    }
};

// Default routes
const DEFAULT_AUTH_ROUTE = 'home';
const DEFAULT_UNAUTH_ROUTE = 'login';

function appendSideBar() {
    const sidebar = document.getElementsByClassName("left-sidebar")[0];
    
    if (sidebar) {
        sidebar.innerHTML = `
            <nav class="side-nav">
                <a href="#home" data-tooltip="Home"><i class="fas fa-home"></i></a>
                <a href="#game-1" data-tooltip="Ping Pong Game"><i class="fas fa-table-tennis"></i></a>
                <a href="#profile" data-tooltip="Profile & Settings"><i class="fas fa-user-cog"></i></a>
                <a href="#friends" data-tooltip="Friends"><i class="fas fa-users"></i></a>
            </nav>
            <!-- Logout container at the bottom -->
            <div class="logout-container">
                <a href="#" data-tooltip="Logout" class="logout" id="logout-btn"><i class="fas fa-sign-out-alt"></i></a>
            </div>
        `;

        // Add logout functionality
        document.getElementById('logout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            
            try {
                const token = getCookieValue('access_token');
                if (!token){
                    window.location.hash = DEFAULT_UNAUTH_ROUTE;
                    return ;    
                }
                else{
                    // Call the backend logout endpoint
                    const response = await fetch('/api/logout/', {
                        method: 'GET',
                        credentials: 'include',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        console.log('Successfully logged out on server');
                        window.location.hash = DEFAULT_UNAUTH_ROUTE;
                    } else {
                        console.error('Server logout failed:', await response.text());
                    }
                }
                
            } catch (error) {
                console.error('Error during logout:', error);
                // If server logout fails, redirect to login anyway
                window.location.hash = DEFAULT_UNAUTH_ROUTE;
            }
            });
    }
}

// Main navigation function
let clean = null;

export async function navigate(route) {
    // Show loading indicator (optional)
    console.log("Navigating to:", route);
    console.log("Authentication status:", isAuthenticated());
    console.log("Route=" + route);
    document.body.classList.add('loading');
    
    try {
        // If no route is provided, check authentication status and redirect accordingly
        if (!route) {
            route = isAuthenticated() ? DEFAULT_AUTH_ROUTE : DEFAULT_UNAUTH_ROUTE;
        }
        
        // Get the route configuration
        const routeConfig = routes[route];
        
        // If route doesn't exist, show 404 page
        if (!routeConfig) {
            const display404 = await routes['404'].loadModule();
            display404();
            return;
        }
        
        // Authentication check
        if (routeConfig.requiresAuth && !isAuthenticated()) {
            console.log('Access denied. Redirecting to login...');
            window.location.hash = DEFAULT_UNAUTH_ROUTE;
            return;
        }
        
        // If user is already authenticated and tries to access a non-auth route (like login)
        if (!routeConfig.requiresAuth && isAuthenticated() && route === DEFAULT_UNAUTH_ROUTE) {
            console.log('Already logged in. Redirecting to home...');
            window.location.hash = DEFAULT_AUTH_ROUTE;
            return;
        }
        
        // Dynamically load the module and display the page
        if (typeof clean === "function")
            clean();
        const displayFunction = await routeConfig.loadModule();
        clean = displayFunction();
        
        // Only append header and sidebar for authenticated routes that aren't 404
        if (isAuthenticated() && route !== '404' && route !== 'login') {
            appendHeader();
            appendSideBar();
        }
    } catch (error) {
        console.error('Navigation error:', error);
    } finally {
        // Hide loading indicator
        document.body.classList.remove('loading');
    }
}

function validUrl() {
    const tempUrl = window.location.href;
    const origin = window.location.origin;

    switch (tempUrl) {
        case `${origin}/`:
        case `${origin}/#login`:
        case `${origin}/#home`:
        case `${origin}/#game-1`:
        case `${origin}/#profile`:
        case `${origin}/#friends`:
        case `${origin}/#404`:
            break;
        default:
            window.location.href = `${origin}/#404`;
    }
}

async function loadPage() {
    validUrl();
    await navigate(location.hash.substring(1));
}

window.addEventListener("hashchange", loadPage);
window.addEventListener("DOMContentLoaded", loadPage);
