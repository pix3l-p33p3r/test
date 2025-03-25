const app = document.getElementById("app");

function displayHome() {
    app.innerHTML = `
    <section class="home">
    <!-- HEADER CONTAINER -->
    <header class="header"></header>    
    <!-- MAIN CONTAINER WITH SIDEBAR AND CONTENT -->
        <div class="main-container">

            <!-- 2. LEFT SIDEBAR -->
            <div class="left-sidebar"></div>

            <!-- 3. MAIN CONTENT AREA -->
            <div class="content">
                <h1 class="game-title1"><i class="fas fa-gamepad"></i> Welcome back, Loading...</h1>
            
                <!-- FUTURISTIC BANNER -->
                <div class="futuristic-banner">
                    <div class="banner-content">
                        <div class="banner-text">
                            <h2>EPIC QUEST</h2>
                            <p>Begin your adventure</p>
                        </div>
                        <!-- image container --> 
                    	<div class="banner-image">
                            <img src="/static/resources/banner.png" alt="Epic Quest Banner">
                        </div>
                	</div>
            	</div>

            	<!-- PLAYER STATS SECTION -->
            	<section class="stats-section">
                	<h2 class="section-title"><i class="fas fa-chart-line"></i> Player Statistics</h2>

                	<div class="stats-container">
                    	<!-- games stats with pie chart -->
                    	<div class="stats-card">
                        	<h3>Games Performance</h3>
                        	<div class="chart-container">
                            	<canvas id="gamesChart"></canvas>
                        	</div>
                        	<div class="stats-details">
                            	<!-- Will be populated dynamically -->
                        	</div>
                    	</div>
                    
						<!-- top 3 players -->
						<div class="stats-card">
    						<h3>Top 3 Players</h3>
    						<div class="top-players-container">
        					<!-- Player data will be loaded dynamically -->
    						</div>
						</div>
                	</div>
            	</section>
            
            	<!-- GAME CENTER SECTION -->
            	<section class="game-section">
                	<h2 class="section-title"><i class="fas fa-gamepad"></i> Game Center</h2>
                
                	<div class="games-container">
                    	<!-- game slide -->
                    	<div class="game-slide">
                        	<div class="slide-controls">
                            	<button class="prev-btn">❮</button>
                            	<button class="next-btn">❯</button>
                        	</div>
                        
                        	<div class="slide-container">
                                <!-- game 1 -->
                                <div class="slide" data-game-mode="ai">
                                    <div class="game-content">
                                        <div class="game-image1">
                                            <img src="/static/resources/ninjaAi3.jpeg" alt="AI Game">
                                            <div class="game-title1-overlay">
                                                <h3>AI Challenge</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                                <!-- game 2 -->
                                <div class="slide" data-game-mode="local">
                                    <div class="game-content">
                                        <div class="game-image1">
                                            <img src="/static/resources/ninjaAi.jpeg" alt="Local Game">
                                            <div class="game-title1-overlay">
                                                <h3>Local Multiplayer</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                                <!-- game 3 -->
                                <div class="slide" data-game-mode="online">
                                    <div class="game-content">
                                        <div class="game-image1">
                                            <img src="/static/resources/ninjaAi1.jpeg" alt="Online Game">
                                            <div class="game-title1-overlay">
                                                <h3>Online Match</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            
                                <!-- game 4 -->
                                <div class="slide" data-game-mode="tournament">
                                    <div class="game-content">
                                        <div class="game-image1">
                                            <img src="/static/resources/local.jpeg" alt="Tournament">
                                            <div class="game-title1-overlay">
                                                <h3>Tournament</h3>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                        	</div>
                    	</div>
                    
                    	<!-- recent games -->
                    	<div class="stats-card">
                        	<h3>Recent Games</h3>
                        	<div class="recent-games-container">
                            	<!-- Recent games will be loaded dynamically -->
                        	</div>
                    	</div>
                	</div>
            	</section>
        	</div>
        </div>
    </section>
    `;
    document.title = 'Home';

    fetchUserAndUpdateWelcome();
    initializeHomeEffects();
    fetchGamePerformance(); // Add this line to fetch game performance data
    fetchTopPlayers();
    fetchRecentGames();
    initializeGameSlideLinks(); // Add this line
}

async function fetchUserAndUpdateWelcome() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token) {
            console.error('No authentication token found');
            updateWelcomeMessage('Adventurer');
            return;
        }
        
        // Fetch user data from the API
        const response = await fetch('/api/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log("Error fetching user data:", response);
            throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        console.log("User data:", data);
        
        // Check if the response contains user data in the expected structure
        if (data.status === true && data.user && data.user.username) {
            updateWelcomeMessage(data.user.username);
        } else {
            console.error('Unexpected data structure:', data);
            updateWelcomeMessage('Adventurer');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        updateWelcomeMessage('Adventurer');
    }
}

function updateWelcomeMessage(username) {
    const gameTitleElement = document.querySelector('.game-title1');
    if (gameTitleElement) {
        gameTitleElement.innerHTML = `<i class="fas fa-gamepad"></i> Welcome back, ${username}!`;
    }
}

// Then modify the initializeGameSlideLinks function:
function initializeGameSlideLinks() {
    const slides = document.querySelectorAll('.slide');
    
    slides.forEach(slide => {
        slide.style.cursor = 'pointer';
        
        // Get game mode from data attribute
        const gameMode = slide.getAttribute('data-game-mode');
        
        if (!gameMode) return;
        
        // Add click event to the entire slide
        slide.addEventListener('click', () => {
            // Navigate to the game page with the specific game mode
            window.location.hash = 'game-1';
            
            // Store the selected game mode to be used after navigation
            localStorage.setItem('selectedGameMode', gameMode);
        });
    });
}

// Function to initialize all the interactive effects for the home page
function initializeHomeEffects() {
    // Game slide functionality
    const slideContainer = document.querySelector('.slide-container');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    if (slideContainer && slides.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        let slideInterval;
        
        function updateSlides() {
            // Use transform to slide smoothly
            slideContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        }
        
        function startAutoSlide() {
            // Clear any existing interval first to prevent multiple intervals
            clearInterval(slideInterval);
            
            // Set new interval
            slideInterval = setInterval(function() {
                currentSlide++;
                if (currentSlide >= slides.length) {
                    currentSlide = 0;
                }
                updateSlides();
            }, 4000); // Change slides every 4 seconds
        }
        
        prevBtn.addEventListener('click', function() {
            currentSlide--;
            if (currentSlide < 0) {
                currentSlide = slides.length - 1;
            }
            updateSlides();
            // Reset the timer when manually changing slides
            startAutoSlide();
        });
        
        nextBtn.addEventListener('click', function() {
            currentSlide++;
            if (currentSlide >= slides.length) {
                currentSlide = 0;
            }
            updateSlides();
            // Reset the timer when manually changing slides
            startAutoSlide();
        });
        
        // Initialize slide position
        updateSlides();
        
        // Start automatic sliding
        startAutoSlide();
        
        // Pause the auto-sliding when hovering over the slider
        slideContainer.addEventListener('mouseenter', function() {
            clearInterval(slideInterval);
        });
        
        // Resume auto-sliding when the mouse leaves
        slideContainer.addEventListener('mouseleave', function() {
            startAutoSlide();
        });
    }
}

function getCookieValue(name) {
    const cookies = document.cookie.split(";");
    
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null; // Return null if the cookie is not found
}

// Function to fetch game performance data from backend
async function fetchGamePerformance() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token) {
            console.error('No authentication token found');
            displayNoPerformanceData();
            return;
        }
        
        // Update this URL to match your API route for game performance
        const response = await fetch('/api/user/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log("Error fetching game performance:", response);
            throw new Error('Failed to fetch game performance data');
        }
        
        const data = await response.json();
        console.log("Game performance data:", data);
        
        // Check if the response contains user data in the expected structure
        if (data.status === true && data.user) {
            // Pass the user object to the display function
            displayGamePerformance(data.user);
        } else {
            console.error('Unexpected data structure:', data);
            displayNoPerformanceData();
        }
    } catch (error) {
        console.error('Error fetching game performance:', error);
        displayNoPerformanceData();
    }
}

// Function to display game performance in the UI
function displayGamePerformance(userData) {
    const statsCard = document.querySelector('.stats-card:first-child');
    
    if (!statsCard) {
        console.error("Stats card element not found");
        return;
    }
    
    // Clear existing content
    statsCard.innerHTML = '';
    
    // Check if we have the required data
    if (!userData || userData.total_game_played === undefined || userData.score === undefined) {
        displayNoPerformanceData();
        return;
    }

    // check if there are no games played yet
    if (userData.total_game_played === 0) {
        displayNoPerformanceData();
        return;
    }
    
    // Calculate game statistics
    const wonGames = Math.floor(userData.score / 10);
    const lostGames = userData.total_game_played - wonGames;
    const winRate = userData.total_game_played > 0 
        ? Math.round((wonGames / userData.total_game_played) * 100) 
        : 0;
    
    // Create the HTML structure
    statsCard.innerHTML = `
        <h3>Games Performance</h3>
        <div class="chart-container" style="position: relative; height: 180px; width: 100%;">
            <canvas id="gamesChart"></canvas>
        </div>
        <div class="stats-details">
            <div class="stat-item">
                <span class="stat-label">Games Won</span>
                <span class="stat-value win">${wonGames}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Games Lost</span>
                <span class="stat-value loss">${lostGames}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Win Rate</span>
                <span class="stat-value">${winRate}%</span>
            </div>
        </div>
    `;
    
    // Create the chart after the HTML is updated
    const chartCanvas = document.getElementById('gamesChart');
    if (chartCanvas && typeof Chart !== 'undefined') {
        try {
            const ctx = chartCanvas.getContext('2d');
            new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Won', 'Lost'],
                    datasets: [{
                        data: [wonGames, lostGames],
                        backgroundColor: [
                            '#61c8b3', // Win color - teal
                            '#c8465f'  // Loss color - wine red
                        ],
                        borderColor: '#1a0f14',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: '#e6d0d6',
                                font: {
                                    family: 'Montserrat',
                                    size: 12
                                },
                                padding: 15
                            }
                        }
                    }
                }
            });
            console.log('Pie chart initialized successfully');
        } catch (error) {
            console.error('Error creating chart:', error);
            // If chart creation fails, display text data instead
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div class="text-stats">
                        <div>Won: ${wonGames} games</div>
                        <div>Lost: ${lostGames} games</div>
                    </div>
                `;
            }
        }
    }
}

// Function to display "No performance data yet" message
function displayNoPerformanceData() {
    const statsCard = document.querySelector('.stats-card:first-child');
    
    if (statsCard) {
        statsCard.innerHTML = `
            <h3>Games Performance</h3>
            <div class="no-data-message">
                <i class="fas fa-info-circle"></i>
                <p>No performance data available yet</p>
            </div>
        `;
    }
}

// Function to fetch top players data from backend
async function fetchTopPlayers() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token) {
            console.error('No authentication token found');
            displayNoPlayersData();
            return;
        }
        
        // Update this URL to match your API route
        const response = await fetch('/api/top/players/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log("Error fetching leaderboard:", response);
            throw new Error('Failed to fetch leaderboard data');
        }
        
        const data = await response.json();
        console.log("Top players data:", data);
        
        // Check for the correct property name in the response
        const leaderboardData = data.TopPlayers;
        
        // Update UI with top players
        if (leaderboardData && leaderboardData.length > 0) {
            displayTopPlayers(leaderboardData);
        } else {
            displayNoPlayersData();
        }
    } catch (error) {
        console.error('Error fetching top players:', error);
        displayNoPlayersData();
    }
}

// Function to display top players in the UI
function displayTopPlayers(leaderboardData) {
    const topPlayersContainer = document.querySelector('.top-players-container');
    
    // Clear existing content
    topPlayersContainer.innerHTML = '';
    
    // Check if we have player data
    if (!leaderboardData || !leaderboardData.length) {
        displayNoPlayersData();
        return;
    }
    
    // Filter out players with score of 0
    const validPlayers = leaderboardData.filter(player => player.score > 0);
    
    // If no players have scores above 0, show no data message
    if (validPlayers.length === 0) {
        displayNoPlayersData();
        return;
    }
    
    // Create HTML for each player with score > 0
    validPlayers.forEach((player, index) => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        // Use the player's image if available, otherwise use placeholder
        let imageTemp;

        if (player.uploaded_image) {
            imageTemp = player.uploaded_image; //After Nginex spoiler
        } else if (player.image_url) {
            imageTemp = player.image_url;
        } else {
            imageTemp = '/static/resources/default.jpg';
        }
        
        // Calculate wins based on score (every 10 points = 1 win)
        const wins = Math.floor(player.score / 10);
        
        playerCard.innerHTML = `
            <div class="player-rank">${index + 1}</div>
            <div class="player-avatar">
                <img src="${imageTemp}" alt="Player ${index + 1}">
            </div>
            <div class="player-info">
                <div class="player-name">${player.username}</div>
                <div class="player-stats">
                    <span class="wins-icon"><i class="fas fa-trophy"></i></span>
                    <span class="wins-count">${wins} ${wins === 1 ? 'win' : 'wins'}</span>
                </div>
            </div>
        `;
        
        topPlayersContainer.appendChild(playerCard);
        
        // Add hover effects for the newly created player cards
        playerCard.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#3d232b';
        });
        playerCard.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#2a181e';
        });
    });
}

// Function to display "No data yet" message
function displayNoPlayersData() {
    const topPlayersContainer = document.querySelector('.top-players-container');
    topPlayersContainer.innerHTML = `
        <div class="no-data-message">
            <i class="fas fa-info-circle"></i>
            <p>No player data available yet</p>
        </div>
    `;
}

// Function to fetch recent games data from backend
async function fetchRecentGames() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token) {
            console.error('No authentication token found');
            displayNoRecentGames();
            return;
        }
        
        // Update URL to use the history-matches endpoint
        const response = await fetch('/api/user/history-matches/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            console.log("Error fetching recent games:", response.json());
            throw new Error('Failed to fetch recent games data');
        }
        
        const data = await response.json();
        console.log("Recent games data:", data);
        
        // Check for the correct property name in the response
        const recentGamesData = data.HistoryMatches;
        
        // Update UI with recent games
        if (recentGamesData && recentGamesData.length > 0) {
            displayRecentGames(recentGamesData);
        } else {
            displayNoRecentGames();
        }
    } catch (error) {
        console.error('Error fetching recent games:', error);
        displayNoRecentGames();
    }
}

// Updated function to display recent games with the latest on top
function displayRecentGames(recentGamesData) {
    const recentGamesContainer = document.querySelector('.recent-games-container');
    
    // Clear existing content
    recentGamesContainer.innerHTML = '';
    
    // Check if we have games data
    if (!recentGamesData || !recentGamesData.length) {
        displayNoRecentGames();
        return;
    }
    
    // Sort games by date, newest first
    const sortedGames = [...recentGamesData].sort((a, b) => {
        return new Date(b.match_date) - new Date(a.match_date);
    });
    
    // Create HTML for each recent game
    sortedGames.forEach(game => {
        const gameCard = document.createElement('div');
        gameCard.className = 'game-history-card';
        
        // Format date
        const gameDate = new Date(game.match_date);
        const today = new Date();
        
        let dateDisplay;
        if (gameDate.toDateString() === today.toDateString()) {
            dateDisplay = `Today, ${gameDate.getHours()}:${gameDate.getMinutes().toString().padStart(2, '0')}`;
        } else if (gameDate.toDateString() === new Date(today.getTime() - 86400000).toDateString()) {
            dateDisplay = `Yesterday, ${gameDate.getHours()}:${gameDate.getMinutes().toString().padStart(2, '0')}`;
        } else {
            dateDisplay = `${gameDate.toLocaleDateString()}, ${gameDate.getHours()}:${gameDate.getMinutes().toString().padStart(2, '0')}`;
        }
        
        // Determine if the current user is the winner or loser
        const token = getCookieValue('access_token');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentUserId = payload.user_id;
        
        const isWinner = game.winner.id === currentUserId;
        const resultClass = isWinner ? 'win' : 'loss';
        const resultIcon = isWinner ? 'fas fa-trophy' : 'fas fa-times-circle';
        const resultText = isWinner ? 'Victory' : 'Defeat';

        let imageTempLoser;

        if (game.loser.uploaded_image) {
            imageTempLoser = game.loser.uploaded_image; //After Nginex spoiler
        } else if (game.loser.image_url) {
            imageTempLoser = game.loser.image_url;
        } else {
            imageTempLoser = '/static/resources/default.jpg';
        }
        let imageTempWinner;

        if (game.winner.uploaded_image) {
            imageTempWinner = game.winner.uploaded_image; //After Nginex spoiler
        } else if (game.winner.image_url) {
            imageTempWinner = game.winner.image_url;
        } else {
            imageTempWinner = '/static/resources/default.jpg';
        }
        
        gameCard.innerHTML = `
            <div class="game-details">
                <div class="players-info">
                    <div class="player-left">
                        <img class="player-img" src="${imageTempWinner}">
                        <span class="player-name">${game.winner.username}</span>
                    </div>
                    <div class="score-container">
                        <div class="game-result ${resultClass}">
                            <i class="${resultIcon}"></i> ${resultText}
                        </div>
                        <div class="game-score">${game.winner_score} - ${game.loser_score}</div>
                        <div class="game-date">${dateDisplay}</div>
                    </div>
                    <div class="player-right">
                        <span class="player-name">${game.loser.username}</span>
                        <img class="player-img" src="${imageTempLoser}">
                    </div>
                </div>
            </div>
        `;
        
        recentGamesContainer.appendChild(gameCard);
        
        // Add hover effects for the newly created game cards
        gameCard.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#3d232b';
        });
        gameCard.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#2a181e';
        });
    });
}

// Function to display "No recent games" message
function displayNoRecentGames() {
    const recentGamesContainer = document.querySelector('.recent-games-container');
    recentGamesContainer.innerHTML = `
        <div class="no-data-message">
            <i class="fas fa-info-circle"></i>
            <p>No recent games available</p>
        </div>
    `;
}

export default displayHome;