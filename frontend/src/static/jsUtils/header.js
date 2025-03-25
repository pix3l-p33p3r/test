import { getCookieValue, setProfileImage, setProfileImage2 } from "./auth.js";


export default function appendHeader() {
    const header = document.getElementsByClassName("header")[0];
    
    if (header) {
        header.innerHTML = `
            <div class="logo">PONG</div>
            <div class="search-bar">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search..." id="searchInput">
            </div>
            <div class="user-controls">
                <div class="notification">
                    <i class="fa-solid fa-bell"></i>
                    <div class="indicator"></div>
                </div>
                <div id="ProfilePOPuphere" class="profile" style="cursor: pointer;">
                    <img id="profile-pic" src="/static/resources/default.jpg" alt="Player Avatar">
                    <div class="user-info">
                        <div class="username">default</div>
                        <div class="email-container">
                            <div class="email">default@gmail.com</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        //Fetch User Data
        fetchUserData1();
        let profilePopUp = document.getElementById('ProfilePOPuphere');

        profilePopUp.addEventListener('click', function() {
            fetchAndDisplayCurrentUserData();
        });
        

        const searchInput = document.getElementById("searchInput");
        searchInput.addEventListener("keypress", async function(event) {
            if (event.key === "Enter") {
                event.preventDefault();
                
                const searchQuery = searchInput.value.trim();
                
                if (searchQuery) {
                    try {
                        const authToken = getCookieValue('access_token'); 
                        if (!authToken){
                            console.error('No authentication token found');
                            window.location.hash = 'login';
                            return;
                        }
                        const response = await fetch(`/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${authToken}`,
                                'Content-Type': 'application/json'
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error('Search request failed');
                        }
                        
                        const data = await response.json();
                        if (data.State === true) {
                            handleSearchResults(data.Users);
                        } else {
                            console.error('Search error:', data);
                        }
                    } catch (error) {
                        console.error('Error during search:', error);
                    }
                }
            }
        });
    }
}

async function fetchAndDisplayCurrentUserData() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token){
            console.error('No authentication token found');
            window.location.hash = 'login';
            return;
        }
        const response = await fetch('/api/user/', {
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
        
        // Setup the profile click handler after we have the data
        showCurrentUserProfilePopup(userData.user);
        
    } catch (error) {
        console.error('Error fetching user data:', error);
        console.log('Failed to load user data. Please try again later.');
    }
}

// Function to display the current user profile popup
function showCurrentUserProfilePopup(user) {
    // Remove any existing popup
    const existingPopup = document.getElementById("userProfilePopup");
    if (existingPopup) {
        document.body.removeChild(existingPopup);
    }
    
    // Create the popup container
    const popup = document.createElement("div");
    popup.id = "userProfilePopup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.backgroundColor = "#1a0f14"; // Dark background like the profile page
    popup.style.padding = "30px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
    popup.style.zIndex = "2000";
    popup.style.width = "700px"; // Increased width
    popup.style.maxWidth = "95%";
    popup.style.maxHeight = "85vh";
    popup.style.overflowY = "auto";
    popup.style.color = "#e6d0d6"; // Light text like the profile page
    popup.style.border = "1px solid #3d232b"; // Border like other elements
    //Setting User Image
    let imageTemp;

    if (user.uploaded_image) {
        imageTemp = user.uploaded_image; //After Nginex spoiler
    } else if (user.image_url) {
        imageTemp = user.image_url;
    } else {
        imageTemp = '/static/resources/default.jpg';
    }
    
    // Create the popup content
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #3d232b; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #c8465f; font-size: 28px;">Your Profile</h2>
        </div>
        
        <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
            <div style="margin-right: 20px;">
                <img src="${imageTemp}" alt="${user.username}" 
                    style="width: 120px; height: 120px; border-radius: 10%; object-fit: cover; border: 3px solid #3d232b;">
            </div>
            <div style="flex-grow: 1;">
                <div style="margin-bottom: 15px; background-color: #2a181e; border-radius: 8px; padding: 15px; border: 1px solid #3d232b;">
                    <div style="margin-bottom: 17px;">
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Username    :</span>
                        <span style="color: #e6d0d6;">${user.username}</span>
                    </div>
                    <div style="margin-bottom: 17px;">
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Full Name:</span>
                        <span style="color: #e6d0d6;">${user.full_name || 'Not provided'}</span>
                    </div>
                    <div>
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">  Email         :</span>
                        <span style="color: #e6d0d6;">${user.email || 'No email provided'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">Bio</h3>
            <p style="margin: 0; color: #a89a9e; padding: 10px; background-color: #2a181e; border-radius: 8px; border: 1px solid #3d232b;">
                ${user.bio || 'You have not added a bio yet.'}
            </p>
        </div>
        
        <div>
            <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">
                <i class="fas fa-chart-line"></i> Games Performance
            </h3>
            <div class="user-stats-container" style="background-color: #2a181e; border-radius: 8px; padding: 20px; border: 1px solid #3d232b;">
                <!-- This content will be updated dynamically by updateUserGameStats -->
                <div class="no-data-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Loading performance data...</p>
                </div>
            </div>
        </div>
    `;
    
    // Create overlay background
    const overlay = document.createElement("div");
    overlay.id = "profileOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.zIndex = "1999";
    
    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Close when clicking overlay
    overlay.addEventListener("click", () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
    });
    fetchCurrentUserGameStats();
}

// Update the fetchAndDisplayCurrentUserData function to include the profile popup functionality


function handleSearchResults(users) {
    
    // Get the search bar and ensure it has relative positioning
    const searchBar = document.querySelector(".search-bar");
    searchBar.style.position = "relative"; // This is crucial for absolute positioning of children
    
    // Create or clear the search results container
    let searchResultsContainer = document.getElementById("searchResultsContainer");
    
    if (!searchResultsContainer) {
        // If the container doesn't exist, create it
        searchResultsContainer = document.createElement("div");
        searchResultsContainer.id = "searchResultsContainer";
        searchResultsContainer.className = "search-results-container";
        
        // Append it to the search bar
        searchBar.appendChild(searchResultsContainer);
    } else {
        // If it exists, clear its contents
        searchResultsContainer.innerHTML = "";
    }
    
    // Style the container - position it relative to the search bar
    searchResultsContainer.style.position = "absolute";
    searchResultsContainer.style.top = "100%"; // Position it right below the search bar
    searchResultsContainer.style.left = "0";
    searchResultsContainer.style.right = "0"; // Full width of parent
    searchResultsContainer.style.backgroundColor = "#2a181e";
    searchResultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
    searchResultsContainer.style.borderRadius = "4px";
    searchResultsContainer.style.zIndex = "1000";
    searchResultsContainer.style.maxHeight = "300px";
    searchResultsContainer.style.overflowY = "auto";
    searchResultsContainer.style.border = "1px solid #8c4b5a";
    searchResultsContainer.style.marginTop = "5px"; // Small gap between search bar and results
    
    // Add results or "No user found" message
    if (users && users.length > 0) {
        users.forEach(user => {
            const userElement = document.createElement("div");
            userElement.className = "user-result";
            userElement.style.display = "flex";
            userElement.style.alignItems = "center";
            userElement.style.padding = "10px";
            userElement.style.cursor = "pointer";
            userElement.style.borderBottom = "1px solid #3a1f1f";
            userElement.style.color = "#e6e6e6";
            
            // Hover effect
            userElement.onmouseenter = function() {
                this.style.backgroundColor = "#c8465f";
            };
            userElement.onmouseleave = function() {
                this.style.backgroundColor = "transparent";
            };
            
            userElement.innerHTML = `
                <img src="${user.img_url || '/static/resources/default.jpg'}" alt="${user.username}" 
                        style="width: 32px; height: 32px; border-radius: 5px; margin-right: 10px;">
                <span>${user.username}</span>
            `;
            
            // Add click event to show the user profile popup
            userElement.addEventListener("click", () => {
                showUserProfilePopup(user);
            });
            
            searchResultsContainer.appendChild(userElement);
        });
    } else {
        const noResultsElement = document.createElement("div");
        noResultsElement.className = "no-results";
        noResultsElement.textContent = "No user found";
        noResultsElement.style.padding = "15px";
        noResultsElement.style.textAlign = "center";
        noResultsElement.style.color = "#e74c6b";
        
        searchResultsContainer.appendChild(noResultsElement);
    }
    
    // Add click event to close results when clicking outside
    document.addEventListener("click", function(event) {
        if (!searchResultsContainer.contains(event.target) && 
            !searchBar.contains(event.target)) {
            searchResultsContainer.style.display = "none";
        }
    });
    
    // Show the results container
    searchResultsContainer.style.display = "block";
}

function showUserProfilePopup(user) {
    // Remove any existing popup
    const existingPopup = document.getElementById("userProfilePopup");
    if (existingPopup) {
        document.body.removeChild(existingPopup);
    }
    
    // Create the popup container
    const popup = document.createElement("div");
    popup.id = "userProfilePopup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.backgroundColor = "#1a0f14"; // Dark background like the profile page
    popup.style.padding = "30px";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
    popup.style.zIndex = "2000";
    popup.style.width = "700px"; // Increased width
    popup.style.maxWidth = "95%";
    popup.style.maxHeight = "85vh";
    popup.style.overflowY = "auto";
    popup.style.color = "#e6d0d6"; // Light text like the profile page
    popup.style.border = "1px solid #3d232b"; // Border like other elements
    console.log(user);
    // Create the popup content
    popup.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #3d232b; padding-bottom: 10px;">
            <h2 style="margin: 0; color: #c8465f; font-size: 28px;">${user.username}'s Profile</h2>
            <button class="add-friend" style="background-color: #c8465f; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Add Friend</button>
        </div>
        
        <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
            <div style="margin-right: 20px;">
                <img src="${user.img_url || '/static/resources/default.jpg'}" alt="${user.username}" 
                    style="width: 120px; height: 120px; border-radius: 10%; object-fit: cover; border: 3px solid #3d232b;">
            </div>
            <div style="flex-grow: 1;">
                <div style="margin-bottom: 15px; background-color: #2a181e; border-radius: 8px; padding: 15px; border: 1px solid #3d232b;">
                    <div style="margin-bottom: 17px;">
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Username    :</span>
                        <span style="color: #e6d0d6;">${user.username}</span>
                    </div>
                    <div style="margin-bottom: 17px;">
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Full Name:</span>
                        <span style="color: #e6d0d6;">${user.full_name || 'Not provided'}</span>
                    </div>
                    <div>
                        <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">  Email         :</span>
                        <span style="color: #e6d0d6;">${user.email || 'No email provided'}</span>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">Bio</h3>
            <p style="margin: 0; color: #a89a9e; padding: 10px; background-color: #2a181e; border-radius: 8px; border: 1px solid #3d232b;">
                ${user.bio || 'This user has not added a bio yet.'}
            </p>
        </div>
        
        <div>
            <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">
                <i class="fas fa-chart-line"></i> Games Performance
            </h3>
            <div class="user-stats-container" style="background-color: #2a181e; border-radius: 8px; padding: 20px; border: 1px solid #3d232b;">
                <!-- This content will be updated dynamically by updateUserGameStats -->
                <div class="no-data-message">
                    <i class="fas fa-info-circle"></i>
                    <p>Loading performance data...</p>
                </div>
            </div>
        </div>
    `;
    


    // Create overlay background
    const overlay = document.createElement("div");
    overlay.id = "profileOverlay";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.zIndex = "1999";
    
    // Add to document
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
    
    // Close when clicking outside the popup
    overlay.addEventListener("click", () => {
        document.body.removeChild(popup);
        document.body.removeChild(overlay);
    });

    // Add friend
    const addFriendButton = document.querySelector('.add-friend');
    addFriendButton.style.display = 'none'; // Initially hide the button

    // Add friend
    addFriendButton.addEventListener('click', async function() {
        try {
            // Disable button immediately while waiting for response
            addFriendButton.disabled = true;
            addFriendButton.style.backgroundColor = "#8a3042"; // Darker color when disabled
            
            const token_100 = getCookieValue('access_token');
            if (!token_100){
                console.error('No authentication token found');
                window.location.hash = 'login';
                return;
            }
            const response = await fetch(`/api/invitation/send/${user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token_100}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (!response.ok) {
                throw new Error('Failed to add friend');
            }
            
            const data = await response.json();
            
            // Update button to reflect pending status
            updateAddFriendButton('pending');
            
        } catch (error) {
            console.error('Error adding friend:', error);
            addFriendButton.disabled = false;
            addFriendButton.style.backgroundColor = "#c8465f"; // Reset color
        }
    });
    fetchRelation(user.id);
    fetchUserGameStats(user.id);
}

async function fetchRelation(userId) {
    try {
        const token_100 = getCookieValue('access_token');
        if (!token_100){
            console.error('No authentication token found');
            window.location.hash = 'login';
            return;
        }

        const response = await fetch(`/api/user/relation/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token_100}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch relationship status');
        }
        
        const data = await response.json();
        // Update the button based on the relationship status
        updateAddFriendButton(data.message);
        
    } catch (error) {
        console.error('Error fetching relationship status:', error);
    }
}

function updateAddFriendButton(status) {
    const addFriendButton = document.querySelector('.add-friend');
    
    // Reset button styles
    addFriendButton.style.backgroundColor = "#c8465f";
    addFriendButton.disabled = false;
    
    switch(status) {
        case 'nothing':
            // Show "Add Friend" button
            addFriendButton.textContent = 'Add Friend';
            addFriendButton.style.display = 'block';
            break;
        case 'pending':
            // Show "Pending" button
            addFriendButton.textContent = 'Pending';
            addFriendButton.style.display = 'block';
            addFriendButton.disabled = true;
            addFriendButton.style.backgroundColor = "#8a3042";
            break;
        case 'friends':
            // Hide the button completely
            addFriendButton.style.display = 'none';
            break;
        default:
            // Hide the button if status is unexpected
            addFriendButton.style.display = 'none';
    }
}


//Function to Fetch User Data
async function fetchUserData1() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token){
                console.error('No authentication token found');
                window.location.hash = 'login';
                return;
        }
        const response = await fetch('/api/user/', {
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

        // Update header UI with fetched data
        const headerUsername = document.getElementsByClassName('username')[0];
        const headerEmail = document.getElementsByClassName('email')[0];
        const headerImage = document.getElementById('profile-pic');
        if (headerUsername)
            headerUsername.textContent = userData.user.username;
        
        if (headerEmail)
            headerEmail.textContent = userData.user.email;

        if (headerImage)
            headerImage.src = setProfileImage2(userData);
    } catch (error) {
        console.error('Error fetching user data:', error);
        console.log('Failed to load user data. Please try again later.');
    }
}

// Function to fetch user game stats
async function fetchUserGameStats(userId) {
    try {
        const token = getCookieValue('access_token');
        if (!token){
            console.error('No authentication token found');
            window.location.hash = 'login';
            return;
        }
        // Use the same API endpoint pattern as in home.js
        const response = await fetch(`/api/user/${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }
        
        const data = await response.json();
        
        // Check if user data exists in the expected structure
        if (data.status === true && data.user) {
            updateUserGameStats(data.user);
        } else {
            displayNoUserGameStats();
        }
    } catch (error) {
        console.error('Error fetching user game stats:', error);
        displayNoUserGameStats();
    }
}

// Function to fetch user game stats
async function fetchCurrentUserGameStats() {
    try {
        const token = getCookieValue('access_token');
        if (!token){
            console.error('No authentication token found');
            window.location.hash = 'login';
            return;
        }
        // Use the same API endpoint pattern as in home.js
        const response = await fetch(`/api/user/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user stats');
        }
        
        const data = await response.json();
        
        // Check if user data exists in the expected structure
        if (data.status === true && data.user) {
            updateUserGameStats(data.user);
        } else {
            displayNoUserGameStats();
        }
    } catch (error) {
        console.error('Error fetching user game stats:', error);
        displayNoUserGameStats();
    }
}

// Function to update the UI with fetched game stats
function updateUserGameStats(userData) {
    const statsContainer = document.querySelector('.user-stats-container');
    
    if (!statsContainer) {
        console.error("Stats container element not found");
        return;
    }
    
    // Clear existing content
    statsContainer.innerHTML = '';
    
    // Check if we have the required data
    if (!userData || userData.total_game_played === undefined || userData.score === undefined) {
        displayNoUserGameStats();
        return;
    }

    // If no matches played yet
    if (userData.total_game_played === 0) {
        displayNoUserGameStats();
        return;
    }
    
    // Calculate game statistics - same logic as in home.js
    const wonGames = Math.floor(userData.score / 10);
    const lostGames = userData.total_game_played - wonGames;
    const winRate = userData.total_game_played > 0 
        ? Math.round((wonGames / userData.total_game_played) * 100) 
        : 0;
    
    // Create the HTML structure matching home.js
    statsContainer.innerHTML = `
        <div style="display: flex;">
            <div style="flex: 1; position: relative;">
                <canvas id="userGamesChart" style="height: 180px;"></canvas>
            </div>
            <div style="flex: 1; padding-left: 20px;">
                <div class="stats-details" style="display: flex; flex-direction: column; height: 100%; justify-content: center;">
                    <div class="stat-item" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Games Won:</span>
                        <span class="stat-value win" style="font-size: 20px; color: #61c8b3; font-weight: bold;">${wonGames}</span>
                    </div>
                    <div class="stat-item" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Games Lost:</span>
                        <span class="stat-value loss" style="font-size: 20px; color: #c8465f; font-weight: bold;">${lostGames}</span>
                    </div>
                    <div class="stat-item" style="display: flex; justify-content: space-between; align-items: center;">
                        <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Win Rate:</span>
                        <span class="stat-value" style="font-size: 20px; color: #e6d0d6; font-weight: bold;">${winRate}%</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create the chart after the HTML is updated - same settings as in home.js
    const chartCanvas = document.getElementById('userGamesChart');
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
                                padding: 10
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating user game chart:', error);
            // If chart creation fails, display text data instead
            const chartArea = statsContainer.querySelector('div[style="flex: 1; position: relative;"]');
            if (chartArea) {
                chartArea.innerHTML = `
                    <div class="text-stats" style="display: flex; flex-direction: column; justify-content: center; height: 100%; text-align: center;">
                        <div style="margin-bottom: 10px; color: #61c8b3;">Won: ${wonGames} games</div>
                        <div style="color: #c8465f;">Lost: ${lostGames} games</div>
                    </div>
                `;
            }
        }
    }
}

// Function to display "No performance data yet" message - matching home.js style
function displayNoUserGameStats() {
    const statsContainer = document.querySelector('.user-stats-container');
    
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-info-circle"></i>
                <p>No performance data available yet</p>
            </div>
        `;
    }
}

