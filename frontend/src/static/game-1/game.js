import { getCookieValue, isAuthenticated } from "/static/jsUtils/auth.js";
import {Game }from "../gameFront/game.js"; // Import the Game class from your second file

const app = document.getElementById("app");

function displayGame1() {
    document.title = 'Game 1';

    app.innerHTML = `
    <section class="game">
    <!-- HEADER CONTAINER -->
    <header class="header"></header> 
        <!-- MAIN CONTAINER WITH SIDEBAR AND CONTENT -->
        <div class="main-container">

            <!-- 2. LEFT SIDEBAR -->
            <div class="left-sidebar"></div>

            <!-- 3. MAIN CONTENT AREA -->
            <div class="content">
                <!-- Welcome Section -->
                <div class="welcome-section">
                    <h1 class="welcome-title">Welcome back, To PONG</h1>
                    <p class="welcome-subtitle">Choose a game to play. </p>
                </div>

                <!-- Game Boxes -->
                <div class="game-boxes">
                    <!-- Game 1: Dungeon Crawler (AI Mode) -->
                    <div class="game-box" data-game="ai">
                        
                        <div class="game-image" style="background-image: url('/static/resources/ninjaAi3.jpeg')"></div>
                        <div class="game-info">
                            <h3 class="game-title">AI Mode</h3>
                            <p class="game-description">Play against an AI opponent in this challenging match.</p>
                            <button class="play-button"><i class="fas fa-play"></i> Play Now</button>
                        </div>
                    </div>

                    <!-- Game 2: Arena Battle (Local Mode) -->
                    <div class="game-box" data-game="local">
                        
                        <div class="game-image" style="background-image: url('/static/resources/localmode.jpeg')"></div>
                        <div class="game-info">
                            <h3 class="game-title">Local Mode</h3>
                            <p class="game-description">Play with a friend on the same device, tactical combat.</p>
                            <button class="play-button"><i class="fas fa-play"></i> Play Now</button>
                        </div>
                    </div>

                    <!-- Game 3: Puzzle Quest (Online Mode) -->
                    <div class="game-box" data-game="online">
                        
                        <div class="game-image" style="background-image: url('/static/resources/onlinemode.png')"></div>
                        <div class="game-info">
                            <h3 class="game-title">Online Mode</h3>
                            <p class="game-description">Challenge players from around the world in online matches.</p>
                            <button class="play-button"><i class="fas fa-play"></i> Play Now</button>
                        </div>
                    </div>

                    <!-- Game 4: Space Explorer (Tournament Mode) -->
                    <div class="game-box" data-game="tournament">
                        
                        <div class="game-image" style="background-image: url('/static/resources/tournamentmode2.png')"></div>
                        <div class="game-info">
                            <h3 class="game-title">Tournament Mode</h3>
                            <p class="game-description">Compete in a tournament with multiple participants to crown a champion.</p>
                            <button class="play-button"><i class="fas fa-play"></i> Play Now</button>
                        </div>
                    </div>
                    <div id="nicknameModal"></div>
                </div>
            </div>

        </div>
    </section>
    <div id="waiting-screen" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.8); justify-content: center; align-items: center; z-index: 1000;">
        <div style="color: white; text-align: center;">
            <h2>Waiting for opponent...</h2>
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 2s linear infinite; margin: 20px auto;"></div>
        </div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    `;

    let currentGame = null;

    // Add event listeners to game boxes
    document.querySelectorAll('.game-box').forEach(box => {
        // document.getElementsById('').style.display = 'none';
        box.addEventListener('click', async function() {
            try {
                const token = getCookieValue('access_token');


                if (!token){
                    console.error('No authentication token found');
                    window.location.hash = 'login';
                    return;
                }

                const response = await fetch('/api/user', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });


                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }

                const userData = await response.json();

                // Start the game based on the data-game attribute
                const gameMode = this.getAttribute('data-game');
                startGame(gameMode, userData);

            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Failed to load user data. Please try again later.');
            }
        });
    });

    checkForSelectedGameMode();

    // Add this to your displayGame1 function in game.js after the HTML is set
    function checkForSelectedGameMode() {
        const selectedGameMode = localStorage.getItem('selectedGameMode');
        
        if (selectedGameMode) {
            localStorage.removeItem('selectedGameMode');
            
            const gameBox = document.querySelector(`.game-box[data-game="${selectedGameMode}"]`);
            
            if (gameBox) {
                gameBox.click();
            }
        }
    }

    function startGame(mode, userData) {
        // First, clear the content area
        const contentArea = document.querySelector('.content');
        const savedHTML = contentArea.innerHTML;

        // Create a game container
        contentArea.innerHTML = '<div id="game-container" style="width: 100%; overflow: hidden; height: 100vh;"></div>';
        const gameContainer = document.getElementById('game-container');

        // If there's an existing game, clean it up
        if (currentGame) {
            currentGame.cleanup();
        }

        // Create a back button
        const backButton = document.createElement('button');
        backButton.style.padding = '14px 24px'; 
        backButton.style.backgroundColor = '#c8465f';
        backButton.style.color = '#e6d0d6';
        backButton.style.border = 'none';
        backButton.style.borderRadius = '6px';
        backButton.style.cursor = 'pointer';
        backButton.style.fontWeight = 'bold'; 
        backButton.style.fontSize = '16px';
        backButton.style.transition = 'all 0.2s ease';
        backButton.style.display = 'flex';
        backButton.style.alignItems = 'center';
        backButton.style.gap = '8px';
        backButton.style.marginBottom = '30px';
        backButton.textContent = 'Back to Menu';
        // For the hover effect, you'll need to use event listeners
        backButton.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#a73d53';
        });
        
        backButton.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#c8465f';
        });


        backButton.addEventListener('click', () => {
            if (currentGame) {
                currentGame.cleanup();
                currentGame = null;
            }
            contentArea.innerHTML = savedHTML;
            
            // Re-add event listeners to the game boxes
            document.querySelectorAll('.game-box').forEach(box => {
                box.addEventListener('click', function() {
                    const gameMode = this.getAttribute('data-game');
                    startGame(gameMode, userData);
                });
            });
        });
        
        gameContainer.appendChild(backButton);

        // Map data-game attributes to actual game modes
        const modeMap = {
            'ai': 'Ai',
            'local': 'local',
            'online': 'online',
            'tournament': 'Tournement'  // Note: maintain the spelling used in your second file
        };

        // Start the game with the selected mode
        const gameModeFormatted = modeMap[mode];
        currentGame = new Game(gameModeFormatted, userData.user.id);
        // Set up the animation loop
        function animation() {
            if (currentGame) {
                currentGame.update();
                currentGame.render();
                requestAnimationFrame(animation);
            }
        }
        animation();
    }
    return function() {
        if(document.getElementById("nicknameModal") != null)
            document.getElementById("nicknameModal").style.display = 'none'
        if (currentGame && currentGame.ws && currentGame.ws.readyState === WebSocket.OPEN)
            currentGame.ws.close();
    }
}

async function fetchUserData() {
    try {
        const token = getCookieValue('access_token');


        if (!token){
            console.error('No authentication token found');
            window.location.hash = 'login';
            return;
        }

        const response = await fetch('/api/user', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });


        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const userData = await response.json();

        // Start the game based on the data-game attribute
        const gameMode = this.getAttribute('data-game');
        startGame(gameMode, userData);

    } catch (error) {
        console.error('Error fetching user data:', error);
        alert('Failed to load user data. Please try again later.');
    }
}

document.addEventListener('DOMContentLoaded', displayGame1);

export default displayGame1;