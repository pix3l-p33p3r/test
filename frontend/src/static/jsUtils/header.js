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
        if (!token) {
            console.error('No authentication token found');
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

    addFriendButton.addEventListener('click', async function() {
        try {
            // Disable button immediately while waiting for response
            addFriendButton.disabled = true;
            addFriendButton.style.backgroundColor = "#8a3042"; // Darker color when disabled
            
            const token_100 = getCookieValue('access_token');
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
            
            // On success, change to "Pending" instead of re-enabling
            addFriendButton.textContent = 'Pending';
            
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
        // Disable button immediately while waiting for response
        const token_100 = getCookieValue('access_token');
        const response = await fetch(`/api/user/relation/${userId}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${token_100}`,
                'Content-Type': 'application/json'
            },
        });
        
        if (!response.ok) {
            throw new Error('Failed to add friend');
        }
        
        const data = await response.json();
        
        // On success, change to "Pending" instead of re-enabling
        // addFriendButton.textContent = 'Pending';
        
    } catch (error) {
        console.error('Error adding friend:', error);
        // addFriendButton.disabled = false;
    }
}


//Function to Fetch User Data
async function fetchUserData1() {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        if (!token) {
            console.error('No authentication token found');
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


// Function to fetch current user data and update the popup
// async function fetchAndDisplayCurrentUserData(popup) {
//     try {
//         const authToken = getCookieValue('access_token');
        
//         // Fetch the current user data
//         const response = await fetch('http://127.0.0.1:8000/api/user/', {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${authToken}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch user data');
//         }
        
//         const userData = await response.json();
        
//         // Update the popup with user data
//         updateCurrentUserPopupContent(popup, userData);
        
//         // Also fetch game stats for the current user
//         fetchCurrentUserGameStats(userData.id);
        
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         document.getElementById("closeProfileBtn").addEventListener("click", closePopup);
//     }
// }


// import { getCookieValue } from "./auth.js";


// export default function appendHeader() {
//     const header = document.getElementsByClassName("header")[0];
    
//     if (header) {
//         header.innerHTML = `
//             <div class="logo">ROGUE</div>
//             <div class="search-bar">
//                 <i class="fa-solid fa-magnifying-glass"></i>
//                 <input type="text" placeholder="Search..." id="searchInput">
//             </div>
//             <div class="user-controls">
//                 <div class="notification">
//                     <i class="fa-solid fa-bell"></i>
//                     <div class="indicator"></div>
//                 </div>
//                 <div class="profile">
//                     <img src="/static/resources/adadoun.png" alt="Player Avatar">
//                 </div>
//             </div>
//         `;
        
//         const searchInput = document.getElementById("searchInput");
//         searchInput.addEventListener("keypress", async function(event) {
//             if (event.key === "Enter") {
//                 event.preventDefault();
                
//                 const searchQuery = searchInput.value.trim();
                
//                 if (searchQuery) {
//                     try {
//                         const authToken = getCookieValue("access_token"); 
//                         if (!authToken) {
//                             console.error('No authentication token found');
//                             return;
//                         }
//                         const response = await fetch(`http://127.0.0.1:8000/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
//                             method: 'GET',
//                             headers: {
//                                 'Authorization': `Bearer ${authToken}`,
//                                 'Content-Type': 'application/json'
//                             }
//                         });
                        
//                         if (!response.ok) {
//                             throw new Error('Search request failed');
//                         }
                        
//                         const data = await response.json();
//                         console.log("HEEEERE", data);
//                         if (data.State === true) {
//                             handleSearchResults(data.Users);
//                         } else {
//                             console.error('Search error:', data);
//                         }
//                     } catch (error) {
//                         console.error('Error during search:', error);
//                     }
//                 }
//             }
//         });
//     }
// }

// // Function to handle search results
// function handleSearchResults(users) {
//     console.log('User found:', users);
//     // Create or clear the search results container
//     let searchResultsContainer = document.getElementById("searchResultsContainer");
    
//     if (!searchResultsContainer) {
//         // If the container doesn't exist, create it
//         searchResultsContainer = document.createElement("div");
//         searchResultsContainer.id = "searchResultsContainer";
//         searchResultsContainer.className = "search-results-container";
        
//         // Position it below the search bar
//         const searchBar = document.querySelector(".search-bar");
//         if (searchBar) {
//             searchBar.parentNode.insertBefore(searchResultsContainer, searchBar.nextSibling);
//         }
//     } else {
//         // If it exists, clear its contents
//         searchResultsContainer.innerHTML = "";
//     }
    
//     // Style the container to match dark theme with a fixed width
//     searchResultsContainer.style.position = "absolute";
//     searchResultsContainer.style.top = "60px"; 
//     searchResultsContainer.style.left = "50%";
//     searchResultsContainer.style.transform = "translateX(-53%)"; // Center it
//     searchResultsContainer.style.width = "400px"; // Fixed width
//     searchResultsContainer.style.backgroundColor = "#1f1216"; // Dark background matching theme
//     searchResultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
//     searchResultsContainer.style.borderRadius = "4px";
//     searchResultsContainer.style.zIndex = "1000";
//     searchResultsContainer.style.maxHeight = "300px";
//     searchResultsContainer.style.overflowY = "auto";
//     searchResultsContainer.style.border = "1px solid #3d232b"; // Accent color border
    
//     // Add results or "No user found" message
//     if (users && users.length > 0) {
//         users.forEach(user => {
//             const userElement = document.createElement("div");
//             userElement.className = "user-result";
//             userElement.style.display = "flex";
//             userElement.style.alignItems = "center";
//             userElement.style.padding = "10px";
//             userElement.style.cursor = "pointer";
//             userElement.style.borderBottom = "1px solid #3a1f1f"; // Darker border to match theme
//             userElement.style.color = "#e6e6e6"; // Light text for dark background
            
//             // Hover effect
//             userElement.onmouseenter = function() {
//                 this.style.backgroundColor = "#c8465f"; // Slightly lighter on hover
//             };
//             userElement.onmouseleave = function() {
//                 this.style.backgroundColor = "transparent";
//             };
            
//             userElement.innerHTML = `
//                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
//                         style="width: 32px; height: 32px; border-radius: 5px; margin-right: 10px;">
//                 <span>${user.username}</span>
//             `;
            
//             // Add click event to show the user profile popup
//             userElement.addEventListener("click", () => {
//                 showUserProfilePopup(user);
//             });
            
//             searchResultsContainer.appendChild(userElement);
//         });
//     } else {
//         const noResultsElement = document.createElement("div");
//         noResultsElement.className = "no-results";
//         noResultsElement.textContent = "No user found";
//         noResultsElement.style.padding = "15px";
//         noResultsElement.style.textAlign = "center";
//         noResultsElement.style.color = "#e74c6b"; // Using accent color for the message
        
//         searchResultsContainer.appendChild(noResultsElement);
//     }
    
//     // Add click event to close results when clicking outside
//     document.addEventListener("click", function(event) {
//         if (!searchResultsContainer.contains(event.target) && 
//             !document.querySelector(".search-bar").contains(event.target)) {
//             searchResultsContainer.style.display = "none";
//         }
//     });
    
//     // Show the results container
//     searchResultsContainer.style.display = "block";
// }

// // Function to display user profile popup
// function showUserProfilePopup(user) {
//     // Remove any existing popup
//     const existingPopup = document.getElementById("userProfilePopup");
//     if (existingPopup) {
//         document.body.removeChild(existingPopup);
//     }
    
//     // Create the popup container
//     const popup = document.createElement("div");
//     popup.id = "userProfilePopup";
//     popup.style.position = "fixed";
//     popup.style.top = "50%";
//     popup.style.left = "50%";
//     popup.style.transform = "translate(-50%, -50%)";
//     popup.style.backgroundColor = "#1a0f14"; // Dark background like the profile page
//     popup.style.padding = "30px";
//     popup.style.borderRadius = "8px";
//     popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
//     popup.style.zIndex = "2000";
//     popup.style.width = "700px"; // Increased width
//     popup.style.maxWidth = "95%";
//     popup.style.maxHeight = "85vh";
//     popup.style.overflowY = "auto";
//     popup.style.color = "#e6d0d6"; // Light text like the profile page
//     popup.style.border = "1px solid #3d232b"; // Border like other elements
    
//     // Create the popup content
//     popup.innerHTML = `
//         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #3d232b; padding-bottom: 10px;">
//             <h2 style="margin: 0; color: #c8465f; font-size: 28px;">${user.username}'s Profile</h2>
//             <button class="add-friend" style="background-color: #c8465f; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Add Friend</button>
//         </div>
        
//         <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
//             <div style="margin-right: 20px;">
//                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
//                     style="width: 120px; height: 120px; border-radius: 10%; object-fit: cover; border: 3px solid #3d232b;">
//             </div>
//             <div style="flex-grow: 1;">
//                 <div style="margin-bottom: 15px; background-color: #2a181e; border-radius: 8px; padding: 15px; border: 1px solid #3d232b;">
//                     <div style="margin-bottom: 17px;">
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Username:</span>
//                         <span style="color: #e6d0d6;">${user.username}</span>
//                     </div>
//                     <div style="margin-bottom: 17px;">
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Full Name:</span>
//                         <span style="color: #e6d0d6;">${user.full_name || 'Not provided'}</span>
//                     </div>
//                     <div>
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Email:</span>
//                         <span style="color: #e6d0d6;">${user.email || 'No email provided'}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
        
//         <div style="margin-bottom: 30px;">
//             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">Bio</h3>
//             <p style="margin: 0; color: #a89a9e; padding: 10px; background-color: #2a181e; border-radius: 8px; border: 1px solid #3d232b;">
//                 ${user.bio || 'This user has not added a bio yet.'}
//             </p>
//         </div>
        
//         <div>
//             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">
//                 <i class="fas fa-chart-line"></i> Games Performance
//             </h3>
//             <div class="user-stats-container" style="background-color: #2a181e; border-radius: 8px; padding: 20px; border: 1px solid #3d232b;">
//                 <div style="display: flex;">
//                     <div style="flex: 1; position: relative;">
//                         <canvas id="userGamesChart" style="height: 180px;"></canvas>
//                     </div>
//                     <div style="flex: 1; padding-left: 20px;">
//                         <div class="stats-details" style="display: flex; flex-direction: column; height: 100%; justify-content: center;">
//                             <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
//                                 <span style="font-weight: bold; color: #a89a9e;">Games Won:</span>
//                                 <span style="font-size: 20px; color: #61c8b3; font-weight: bold;">${user.games_won || '0'}</span>
//                             </div>
//                             <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
//                                 <span style="font-weight: bold; color: #a89a9e;">Games Lost:</span>
//                                 <span style="font-size: 20px; color: #c8465f; font-weight: bold;">${user.games_lost || '0'}</span>
//                             </div>
//                             <div style="display: flex; justify-content: space-between; align-items: center;">
//                                 <span style="font-weight: bold; color: #a89a9e;">Win Rate:</span>
//                                 <span style="font-size: 20px; color: #e6d0d6; font-weight: bold;">${
//                                     user.games_won && (user.games_won + user.games_lost) > 0 
//                                     ? Math.round((user.games_won / (user.games_won + user.games_lost)) * 100) + '%' 
//                                     : '0%'
//                                 }</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     // Create overlay background
//     const overlay = document.createElement("div");
//     overlay.id = "profileOverlay";
//     overlay.style.position = "fixed";
//     overlay.style.top = "0";
//     overlay.style.left = "0";
//     overlay.style.width = "100%";
//     overlay.style.height = "100%";
//     overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
//     overlay.style.zIndex = "1999";
    
//     // Add to document
//     document.body.appendChild(overlay);
//     document.body.appendChild(popup);
    
//     // Close when clicking outside the popup
//     overlay.addEventListener("click", () => {
//         document.body.removeChild(popup);
//         document.body.removeChild(overlay);
//     });

//     // Initialize pie chart for games performance
//     initUserGameChart(user);

//     // Add friend
//     const addFriendButton = document.querySelector('.add-friend');

//     addFriendButton.addEventListener('click', async function() {
//         try {
//             // Disable button immediately while waiting for response
//             addFriendButton.disabled = true;
//             addFriendButton.style.backgroundColor = "#8a3042"; // Darker color when disabled
            
//             const token_100 = getCookieValue('access_token');
//             const response = await fetch(`http://127.0.0.1:8000/api/invitation/send/${user.id}`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token_100}`,
//                     'Content-Type': 'application/json'
//                 },
//             });
            
//             if (!response.ok) {
//                 throw new Error('Failed to add friend');
//             }
            
//             const data = await response.json();
            
//             // On success, change to "Pending" instead of re-enabling
//             addFriendButton.textContent = 'Pending';
            
//         } catch (error) {
//             console.error('Error adding friend:', error);
//             addFriendButton.disabled = false;
//             addFriendButton.style.backgroundColor = "#c8465f"; // Reset color
//         }
//     });

//     fetchRelation(user.id);
//     // fetchUserGameStats(user.id);
// }

// // Function to initialize the pie chart for user games
// function initUserGameChart(user) {
//     try {
//         const chartCanvas = document.getElementById('userGamesChart');
        
//         if (chartCanvas) {
//             const ctx = chartCanvas.getContext('2d');
            
//             if (ctx) {
//                 const wonGames = user.games_won || 0;
//                 const lostGames = user.games_lost || 0;
                
//                 // If we don't have Chart.js loaded, create a placeholder text
//                 if (typeof Chart === 'undefined') {
//                     ctx.font = '16px Montserrat';
//                     ctx.fillStyle = '#e6d0d6';
//                     ctx.textAlign = 'center';
//                     ctx.fillText('Chart visualization unavailable', chartCanvas.width/2, chartCanvas.height/2);
//                     return;
//                 }
                
//                 new Chart(ctx, {
//                     type: 'pie',
//                     data: {
//                         labels: ['Won', 'Lost'],
//                         datasets: [{
//                             data: [wonGames, lostGames],
//                             backgroundColor: [
//                                 '#61c8b3', // Win color - teal
//                                 '#c8465f'  // Loss color - wine red
//                             ],
//                             borderColor: '#1a0f14',
//                             borderWidth: 2
//                         }]
//                     },
//                     options: {
//                         responsive: true,
//                         maintainAspectRatio: false,
//                         plugins: {
//                             legend: {
//                                 position: 'bottom',
//                                 labels: {
//                                     color: '#e6d0d6',
//                                     font: {
//                                         family: 'Montserrat',
//                                         size: 12
//                                     },
//                                     padding: 10
//                                 }
//                             }
//                         }
//                     }
//                 });
//             }
//         }
//     } catch (error) {
//         console.error('Error initializing user game chart:', error);
//     }
// }

// // Function to fetch user game stats
// async function fetchUserGameStats(userId) {
//     try {
//         const token = getCookieValue('access_token');
        
//         const response = await fetch(`http://127.0.0.1:8000/api/user/stats/${userId}`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch user stats');
//         }
        
//         const data = await response.json();
        
//         if (data.State === true && data.Stats) {
//             updateUserGameStats(data.Stats);
//         }
//     } catch (error) {
//         console.error('Error fetching user game stats:', error);
//     }
// }

// // Function to update the UI with fetched game stats
// function updateUserGameStats(stats) {
//     // Update chart data
//     const chartCanvas = document.getElementById('userGamesChart');
//     if (chartCanvas && typeof Chart !== 'undefined') {
//         const chart = Chart.getChart(chartCanvas);
//         if (chart) {
//             chart.data.datasets[0].data = [stats.games_won || 0, stats.games_lost || 0];
//             chart.update();
//         }
//     }
    
//     // Update stats text
//     const statsContainer = document.querySelector('.stats-details');
//     if (statsContainer) {
//         const statsElements = statsContainer.querySelectorAll('span');
        
//         // Update Games Won
//         if (statsElements[1]) statsElements[1].textContent = stats.games_won || '0';
        
//         // Update Games Lost
//         if (statsElements[3]) statsElements[3].textContent = stats.games_lost || '0';
        
//         // Update Win Rate
//         if (statsElements[5]) {
//             const winRate = stats.games_won && (stats.games_won + stats.games_lost) > 0 
//                 ? Math.round((stats.games_won / (stats.games_won + stats.games_lost)) * 100) + '%' 
//                 : '0%';
//             statsElements[5].textContent = winRate;
//         }
//     }
// }

// async function fetchRelation(userId) {
//     try {
//         // Disable button immediately while waiting for response
//         const token_100 = getCookieValue('access_token');
//         console.log(token_100);
//         const response = await fetch(`http://127.0.0.1:8000/api/user/relation/${userId}`, {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//                 'Authorization': `Bearer ${token_100}`,
//                 'Content-Type': 'application/json'
//             },
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to add friend');
//         }
        
//         const data = await response.json();
        
//         console.log("HEEEREFDGKDSHKJ", data.message);
//         // On success, change to "Pending" instead of re-enabling
//         // addFriendButton.textContent = 'Pending';
        
//     } catch (error) {
//         console.error('Error adding friend:', error);
//         // addFriendButton.disabled = false;
//     }
// }

// import { getCookieValue } from "./auth.js";


// export default function appendHeader() {
//     const header = document.getElementsByClassName("header")[0];
    
//     if (header) {
//         header.innerHTML = `
//             <div class="logo">ROGUE</div>
//             <div class="search-bar">
//                 <i class="fa-solid fa-magnifying-glass"></i>
//                 <input type="text" placeholder="Search..." id="searchInput">
//             </div>
//             <div class="user-controls">
//                 <div class="notification">
//                     <i class="fa-solid fa-bell"></i>
//                     <div class="indicator"></div>
//                 </div>
//                 <div class="profile">
//                     <img src="./resources/adadoun.png" alt="Player Avatar">
//                 </div>
//             </div>
//         `;
        
//         const searchInput = document.getElementById("searchInput");
//         searchInput.addEventListener("keypress", async function(event) {
//             if (event.key === "Enter") {
//                 event.preventDefault();
                
//                 const searchQuery = searchInput.value.trim();
                
//                 if (searchQuery) {
//                     try {
//                         const authToken = getCookieValue('access_token'); 
                        
//                         const response = await fetch(`http://127.0.0.1:8000/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
//                             method: 'GET',
//                             headers: {
//                                 'Authorization': `Bearer ${authToken}`,
//                                 'Content-Type': 'application/json'
//                             }
//                         });
                        
//                         if (!response.ok) {
//                             console.log("EROROOOOOOOR ", response.message);
//                             throw new Error('Search request failed');
//                         }
                        
//                         const data = await response.json();
//                         console.log(data);
//                         if (data.State === true) {
//                             handleSearchResults(data.Users);
//                         } else {
//                             console.error('Search error:', data);
//                         }
//                     } catch (error) {
//                         console.error('Error during search:', error);
//                     }
//                 }
//             }
//         });
//     }
// }

// // Function to handle search results
// function handleSearchResults(users) {
//     console.log('User found:', users);
//     // Create or clear the search results container
//     let searchResultsContainer = document.getElementById("searchResultsContainer");
    
//     if (!searchResultsContainer) {
//         // If the container doesn't exist, create it
//         searchResultsContainer = document.createElement("div");
//         searchResultsContainer.id = "searchResultsContainer";
//         searchResultsContainer.className = "search-results-container";
        
//         // Position it below the search bar
//         const searchBar = document.querySelector(".search-bar");
//         if (searchBar) {
//             searchBar.parentNode.insertBefore(searchResultsContainer, searchBar.nextSibling);
//         }
//     } else {
//         // If it exists, clear its contents
//         searchResultsContainer.innerHTML = "";
//     }
    
//     // Style the container
//     searchResultsContainer.style.position = "absolute";
//     searchResultsContainer.style.top = "60px"; // Adjust based on your header height
//     searchResultsContainer.style.right = "calc(50% - 125px)"; // Center it below the search bar
//     searchResultsContainer.style.width = "250px";
//     searchResultsContainer.style.backgroundColor = "white";
//     searchResultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
//     searchResultsContainer.style.borderRadius = "4px";
//     searchResultsContainer.style.zIndex = "1000";
//     searchResultsContainer.style.maxHeight = "300px";
//     searchResultsContainer.style.overflowY = "auto";
    
//     // Add results or "No user found" message
//     if (users && users.length > 0) {
//         users.forEach(user => {
//             const userElement = document.createElement("div");
//             userElement.className = "user-result";
//             userElement.style.display = "flex";
//             userElement.style.alignItems = "center";
//             userElement.style.padding = "10px";
//             userElement.style.cursor = "pointer";
//             userElement.style.borderBottom = "1px solid #eee";
            
//             userElement.innerHTML = `
//                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
//                         style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;">
//                 <span>${user.username}</span>
//             `;
            
//             // Add click event to show the user profile popup
//             userElement.addEventListener("click", () => {
//                 showUserProfilePopup(user);
//             });
            
//             searchResultsContainer.appendChild(userElement);
//         });
//     } else {
//         const noResultsElement = document.createElement("div");
//         noResultsElement.className = "no-results";
//         noResultsElement.textContent = "No user found";
//         noResultsElement.style.padding = "15px";
//         noResultsElement.style.textAlign = "center";
//         noResultsElement.style.color = "#666";
        
//         searchResultsContainer.appendChild(noResultsElement);
//     }
    
//     // Add click event to close results when clicking outside
//     document.addEventListener("click", function(event) {
//         if (!searchResultsContainer.contains(event.target) && 
//             !document.querySelector(".search-bar").contains(event.target)) {
//             searchResultsContainer.style.display = "none";
//         }
//     });
    
//     // Show the results container
//     searchResultsContainer.style.display = "block";
// }

// // Function to display user profile popup
// function showUserProfilePopup(user) {
//     // Remove any existing popup
//     const existingPopup = document.getElementById("userProfilePopup");
//     if (existingPopup) {
//         document.body.removeChild(existingPopup);
//     }
    
//     // Create the popup container
//     const popup = document.createElement("div");
//     popup.id = "userProfilePopup";
//     popup.style.position = "fixed";
//     popup.style.top = "50%";
//     popup.style.left = "50%";
//     popup.style.transform = "translate(-50%, -50%)";
//     popup.style.backgroundColor = "white";
//     popup.style.padding = "20px";
//     popup.style.borderRadius = "8px";
//     popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
//     popup.style.zIndex = "2000";
//     popup.style.width = "400px";
//     popup.style.maxWidth = "90%";
//     popup.style.maxHeight = "80vh";
//     popup.style.overflowY = "auto";
    
//     // Create the popup content
//     popup.innerHTML = `
//         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
//             <h2 style="margin: 0;">${user.username}'s Profile</h2>
//             <button id="closePopup" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
//         </div>
//         <div style="display: flex; margin-bottom: 20px;">
//             <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
//                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
//             <div style="margin-left: 20px;">
//                 <p><strong>Username:</strong> ${user.username}</p>
//                 <p><strong>Full Name:</strong> ${user.full_name || 'Not provided'}</p>
//                 <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
//             </div>
//         </div>
//         <div>
//             <h3>Bio</h3>
//             <p>${user.bio || 'This user has not added a bio yet.'}</p>
            
//             <h3>Stats</h3>
            
//             <div style="margin-top: 20px; text-align: center;">
//                 <button class="add-friend" style="background-color: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Add Friend</button>
//             </div>
//         </div>
//     `;
    
//     // Create overlay background
//     const overlay = document.createElement("div");
//     overlay.id = "profileOverlay";
//     overlay.style.position = "fixed";
//     overlay.style.top = "0";
//     overlay.style.left = "0";
//     overlay.style.width = "100%";
//     overlay.style.height = "100%";
//     overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
//     overlay.style.zIndex = "1999";
    
//     // Add to document
//     document.body.appendChild(overlay);
//     document.body.appendChild(popup);
    
//     // Add close functionality
//     document.getElementById("closePopup").addEventListener("click", () => {
//         document.body.removeChild(popup);
//         document.body.removeChild(overlay);
//     });
    
//     // Close when clicking outside the popup
//     overlay.addEventListener("click", () => {
//         document.body.removeChild(popup);
//         document.body.removeChild(overlay);
//     });


//     //Add friend
//     const addFriendButton = document.querySelector('.add-friend');

//     addFriendButton.addEventListener('click', async function() {
//     try {
//         // Disable button immediately while waiting for response
//         addFriendButton.disabled = true;
//         const token_100 = getCookieValue('access_token');
//         console.log(token_100);
//         const response = await fetch(`http://127.0.0.1:8000/api/invitation/send/${user.id}`, {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${token_100}`,
//                 'Content-Type': 'application/json'
//             },
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to add friend');
//         }
        
//         const data = await response.json();
        
//         // On success, change to "Pending" instead of re-enabling
//         addFriendButton.textContent = 'Pending';
        
//     } catch (error) {
//         console.error('Error adding friend:', error);
//         addFriendButton.disabled = false;
//     }
//     });

//     fetchRelation(user.id);
//     console.log("After button");
// }

// async function fetchRelation(userId) {
//     try {
//         // Disable button immediately while waiting for response
//         const token_100 = getCookieValue('access_token');
//         console.log(token_100);
//         const response = await fetch(`http://127.0.0.1:8000/api/user/relation/${userId}`, {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//                 'Authorization': `Bearer ${token_100}`,
//                 'Content-Type': 'application/json'
//             },
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to add friend');
//         }
        
//         const data = await response.json();
        
//         console.log("HEEEREFDGKDSHKJ", data.message);
//         // On success, change to "Pending" instead of re-enabling
//         // addFriendButton.textContent = 'Pending';
        
//     } catch (error) {
//         console.error('Error adding friend:', error);
//         // addFriendButton.disabled = false;
//     }
// }

// import { getCookieValue, setProfileImage, setProfileImage2 } from "./auth.js";


// export default function appendHeader() {
//     const header = document.getElementsByClassName("header")[0];
    
//     if (header) {
//         header.innerHTML = `
//             <div class="logo">ROGUE</div>
//             <div class="search-bar">
//                 <i class="fa-solid fa-magnifying-glass"></i>
//                 <input type="text" placeholder="Search..." id="searchInput">
//             </div>
//             <div class="user-controls">
//                 <div class="notification">
//                     <i class="fa-solid fa-bell"></i>
//                     <div class="indicator"></div>
//                 </div>
//                 <div class="profile">
//                     <img id="profile-pic" src="/static/resources/adadoun.png" alt="Player Avatar">
//                     <div class="user-info">
//                         <div class="username">anahna</div>
//                         <div class="email-container">
//                             <div class="email">waranihna@gmail.com</div>
//                             <i class="fa-solid fa-chevron-down dropdown-icon"></i>
//                         </div>
//                         <div class="dropdown-menu">
//                             <div class="dropdown-item">Profile Settings</div>
//                             <div class="dropdown-item">Logout</div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         `;
//         //Fetch User Data
//         fetchUserData();

//         const dropdownIcon = document.querySelector('.dropdown-icon');
//         const dropdownMenu = document.querySelector('.dropdown-menu');
        
//         if (dropdownIcon && dropdownMenu) {
//             dropdownIcon.addEventListener('click', function(event) {
//                 event.stopPropagation();
//                 dropdownMenu.classList.toggle('show');
//             });
            
//             // Close dropdown when clicking outside
//             document.addEventListener('click', function() {
//                 if (dropdownMenu.classList.contains('show')) {
//                     dropdownMenu.classList.remove('show');
//                 }
//             });
//         }
        
//         const searchInput = document.getElementById("searchInput");
//         searchInput.addEventListener("keypress", async function(event) {
//             if (event.key === "Enter") {
//                 event.preventDefault();
                
//                 const searchQuery = searchInput.value.trim();
                
//                 if (searchQuery) {
//                     try {
//                         const authToken = getCookieValue('access_token'); 
                        
//                         const response = await fetch(`/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
//                             method: 'GET',
//                             headers: {
//                                 'Authorization': `Bearer ${authToken}`,
//                                 'Content-Type': 'application/json'
//                             }
//                         });
                        
//                         if (!response.ok) {
//                             console.log("EROROOOOOOOR ", response.message);
//                             throw new Error('Search request failed');
//                         }
                        
//                         const data = await response.json();
//                         console.log(data);
//                         if (data.State === true) {
//                             handleSearchResults(data.Users);
//                         } else {
//                             console.error('Search error:', data);
//                         }
//                     } catch (error) {
//                         console.error('Error during search:', error);
//                     }
//                 }
//             }
//         });
//     }
// }


// //Function to Fetch User Data
// async function fetchUserData() {
//     try {
//         // Get token from cookies
//         const token = getCookieValue('access_token');
//         console.log(token);
//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
//         const response = await fetch('/api/user/', {
//             method: 'GET',

//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         if (!response.ok) {
//             console.log("Error response:", response);
//             throw new Error('Failed to fetch user data');
//         }
        
//         const userData = await response.json();
//         console.log(userData.user);

//         // Update header UI with fetched data
//         const headerUsername = document.getElementsByClassName('username')[0];
//         const headerEmail = document.getElementsByClassName('email')[0];
//         const headerImage = document.getElementById('profile-pic');
//         if (headerUsername)
//             headerUsername.textContent = userData.user.username;
        
//         if (headerEmail)
//             headerEmail.textContent = userData.user.email;

//         if (headerImage)
//             headerImage.src = setProfileImage2(userData);
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         console.log('Failed to load user data. Please try again later.');
//     }
// }

// // Function to fetch user game stats
// async function fetchUserGameStats(userId) {
//     try {
//         const token = getCookieValue('access_token');
        
//         // Use the same API endpoint pattern as in home.js
//         const response = await fetch(`/api/user/${userId}`, {
//             method: 'GET',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to fetch user stats');
//         }
        
//         const data = await response.json();
        
//         // Check if user data exists in the expected structure
//         if (data.status === true && data.user) {
//             updateUserGameStats(data.user);
//         } else {
//             displayNoUserGameStats();
//         }
//     } catch (error) {
//         console.error('Error fetching user game stats:', error);
//         displayNoUserGameStats();
//     }
// }

// // Function to update the UI with fetched game stats
// function updateUserGameStats(userData) {
//     const statsContainer = document.querySelector('.user-stats-container');
    
//     if (!statsContainer) {
//         console.error("Stats container element not found");
//         return;
//     }
    
//     // Clear existing content
//     statsContainer.innerHTML = '';
    
//     // Check if we have the required data
//     if (!userData || userData.total_game_played === undefined || userData.score === undefined) {
//         displayNoUserGameStats();
//         return;
//     }

//     // If no matches played yet
//     if (userData.total_game_played === 0) {
//         displayNoUserGameStats();
//         return;
//     }
    
//     // Calculate game statistics - same logic as in home.js
//     const wonGames = Math.floor(userData.score / 10);
//     const lostGames = userData.total_game_played - wonGames;
//     const winRate = userData.total_game_played > 0 
//         ? Math.round((wonGames / userData.total_game_played) * 100) 
//         : 0;
    
//     // Create the HTML structure matching home.js
//     statsContainer.innerHTML = `
//         <div style="display: flex;">
//             <div style="flex: 1; position: relative;">
//                 <canvas id="userGamesChart" style="height: 180px;"></canvas>
//             </div>
//             <div style="flex: 1; padding-left: 20px;">
//                 <div class="stats-details" style="display: flex; flex-direction: column; height: 100%; justify-content: center;">
//                     <div class="stat-item" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
//                         <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Games Won:</span>
//                         <span class="stat-value win" style="font-size: 20px; color: #61c8b3; font-weight: bold;">${wonGames}</span>
//                     </div>
//                     <div class="stat-item" style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
//                         <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Games Lost:</span>
//                         <span class="stat-value loss" style="font-size: 20px; color: #c8465f; font-weight: bold;">${lostGames}</span>
//                     </div>
//                     <div class="stat-item" style="display: flex; justify-content: space-between; align-items: center;">
//                         <span class="stat-label" style="font-weight: bold; color: #a89a9e;">Win Rate:</span>
//                         <span class="stat-value" style="font-size: 20px; color: #e6d0d6; font-weight: bold;">${winRate}%</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     `;
    
//     // Create the chart after the HTML is updated - same settings as in home.js
//     const chartCanvas = document.getElementById('userGamesChart');
//     if (chartCanvas && typeof Chart !== 'undefined') {
//         try {
//             const ctx = chartCanvas.getContext('2d');
//             new Chart(ctx, {
//                 type: 'pie',
//                 data: {
//                     labels: ['Won', 'Lost'],
//                     datasets: [{
//                         data: [wonGames, lostGames],
//                         backgroundColor: [
//                             '#61c8b3', // Win color - teal
//                             '#c8465f'  // Loss color - wine red
//                         ],
//                         borderColor: '#1a0f14',
//                         borderWidth: 2
//                     }]
//                 },
//                 options: {
//                     responsive: true,
//                     maintainAspectRatio: false,
//                     plugins: {
//                         legend: {
//                             position: 'bottom',
//                             labels: {
//                                 color: '#e6d0d6',
//                                 font: {
//                                     family: 'Montserrat',
//                                     size: 12
//                                 },
//                                 padding: 10
//                             }
//                         }
//                     }
//                 }
//             });
//         } catch (error) {
//             console.error('Error creating user game chart:', error);
//             // If chart creation fails, display text data instead
//             const chartArea = statsContainer.querySelector('div[style="flex: 1; position: relative;"]');
//             if (chartArea) {
//                 chartArea.innerHTML = `
//                     <div class="text-stats" style="display: flex; flex-direction: column; justify-content: center; height: 100%; text-align: center;">
//                         <div style="margin-bottom: 10px; color: #61c8b3;">Won: ${wonGames} games</div>
//                         <div style="color: #c8465f;">Lost: ${lostGames} games</div>
//                     </div>
//                 `;
//             }
//         }
//     }
// }

// // Function to display "No performance data yet" message - matching home.js style
// function displayNoUserGameStats() {
//     const statsContainer = document.querySelector('.user-stats-container');
    
//     if (statsContainer) {
//         statsContainer.innerHTML = `
//             <div class="no-data-message">
//                 <i class="fas fa-info-circle"></i>
//                 <p>No performance data available yet</p>
//             </div>
//         `;
//     }
// }

// // Replace the existing initUserGameChart function with this updated version
// function showUserProfilePopup(user) {
//     // Remove any existing popup
//     const existingPopup = document.getElementById("userProfilePopup");
//     if (existingPopup) {
//         document.body.removeChild(existingPopup);
//     }
    
//     // Create the popup container
//     const popup = document.createElement("div");
//     popup.id = "userProfilePopup";
//     popup.style.position = "fixed";
//     popup.style.top = "50%";
//     popup.style.left = "50%";
//     popup.style.transform = "translate(-50%, -50%)";
//     popup.style.backgroundColor = "#1a0f14"; // Dark background like the profile page
//     popup.style.padding = "30px";
//     popup.style.borderRadius = "8px";
//     popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
//     popup.style.zIndex = "2000";
//     popup.style.width = "700px"; // Increased width
//     popup.style.maxWidth = "95%";
//     popup.style.maxHeight = "85vh";
//     popup.style.overflowY = "auto";
//     popup.style.color = "#e6d0d6"; // Light text like the profile page
//     popup.style.border = "1px solid #3d232b"; // Border like other elements
    
//     // Create the popup content
//     popup.innerHTML = `
//         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #3d232b; padding-bottom: 10px;">
//             <h2 style="margin: 0; color: #c8465f; font-size: 28px;">${user.username}'s Profile</h2>
//             <button class="add-friend" style="background-color: #c8465f; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Add Friend</button>
//         </div>
        
//         <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
//             <div style="margin-right: 20px;">
//                 <img src="${user.avatar || '/static/resources/default.jpg'}" alt="${user.username}" 
//                     style="width: 120px; height: 120px; border-radius: 10%; object-fit: cover; border: 3px solid #3d232b;">
//             </div>
//             <div style="flex-grow: 1;">
//                 <div style="margin-bottom: 15px; background-color: #2a181e; border-radius: 8px; padding: 15px; border: 1px solid #3d232b;">
//                     <div style="margin-bottom: 17px;">
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Username    :</span>
//                         <span style="color: #e6d0d6;">${user.username}</span>
//                     </div>
//                     <div style="margin-bottom: 17px;">
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Full Name:</span>
//                         <span style="color: #e6d0d6;">${user.full_name || 'Not provided'}</span>
//                     </div>
//                     <div>
//                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">  Email         :</span>
//                         <span style="color: #e6d0d6;">${user.email || 'No email provided'}</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
        
//         <div style="margin-bottom: 30px;">
//             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">Bio</h3>
//             <p style="margin: 0; color: #a89a9e; padding: 10px; background-color: #2a181e; border-radius: 8px; border: 1px solid #3d232b;">
//                 ${user.bio || 'This user has not added a bio yet.'}
//             </p>
//         </div>
        
//         <div>
//             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">
//                 <i class="fas fa-chart-line"></i> Games Performance
//             </h3>
//             <div class="user-stats-container" style="background-color: #2a181e; border-radius: 8px; padding: 20px; border: 1px solid #3d232b;">
//                 <!-- This content will be updated dynamically by updateUserGameStats -->
//                 <div class="no-data-message">
//                     <i class="fas fa-info-circle"></i>
//                     <p>Loading performance data...</p>
//                 </div>
//             </div>
//         </div>
//     `;
    


//     // Create overlay background
//     const overlay = document.createElement("div");
//     overlay.id = "profileOverlay";
//     overlay.style.position = "fixed";
//     overlay.style.top = "0";
//     overlay.style.left = "0";
//     overlay.style.width = "100%";
//     overlay.style.height = "100%";
//     overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
//     overlay.style.zIndex = "1999";
    
//     // Add to document
//     document.body.appendChild(overlay);
//     document.body.appendChild(popup);
    
//     // Close when clicking outside the popup
//     overlay.addEventListener("click", () => {
//         document.body.removeChild(popup);
//         document.body.removeChild(overlay);
//     });

//     // Add friend
//     const addFriendButton = document.querySelector('.add-friend');

//     addFriendButton.addEventListener('click', async function() {
//         try {
//             // Disable button immediately while waiting for response
//             addFriendButton.disabled = true;
//             addFriendButton.style.backgroundColor = "#8a3042"; // Darker color when disabled
            
//             const token_100 = getCookieValue('access_token');
//             const response = await fetch(`/api/invitation/send/${user.id}`, {
//                 method: 'POST',
//                 headers: {
//                     'Authorization': `Bearer ${token_100}`,
//                     'Content-Type': 'application/json'
//                 },
//             });
            
//             if (!response.ok) {
//                 throw new Error('Failed to add friend');
//             }
            
//             const data = await response.json();
            
//             // On success, change to "Pending" instead of re-enabling
//             addFriendButton.textContent = 'Pending';
            
//         } catch (error) {
//             console.error('Error adding friend:', error);
//             addFriendButton.disabled = false;
//             addFriendButton.style.backgroundColor = "#c8465f"; // Reset color
//         }
//     });

//     fetchRelation(user.id);
//     fetchUserGameStats(user.id);
// }

// async function fetchRelation(userId) {
//     try {
//         // Disable button immediately while waiting for response
//         const token_100 = getCookieValue('access_token');
//         console.log(token_100);
//         const response = await fetch(`/api/user/relation/${userId}`, {
//             method: 'GET',
//             credentials: 'include',
//             headers: {
//                 'Authorization': `Bearer ${token_100}`,
//                 'Content-Type': 'application/json'
//             },
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to add friend');
//         }
        
//         const data = await response.json();
        
//         console.log("HEEEREFDGKDSHKJ", data.message);
//         // On success, change to "Pending" instead of re-enabling
//         // addFriendButton.textContent = 'Pending';
        
//     } catch (error) {
//         console.error('Error adding friend:', error);
//         // addFriendButton.disabled = false;
//     }
// }
// // import { getCookieValue } from "./auth.js";


// // export default function appendHeader() {
// //     const header = document.getElementsByClassName("header")[0];
    
// //     if (header) {
// //         header.innerHTML = `
// //             <div class="logo">ROGUE</div>
// //             <div class="search-bar">
// //                 <i class="fa-solid fa-magnifying-glass"></i>
// //                 <input type="text" placeholder="Search..." id="searchInput">
// //             </div>
// //             <div class="user-controls">
// //                 <div class="notification">
// //                     <i class="fa-solid fa-bell"></i>
// //                     <div class="indicator"></div>
// //                 </div>
// //                 <div class="profile">
// //                     <img src="./resources/adadoun.png" alt="Player Avatar">
// //                 </div>
// //             </div>
// //         `;
        
// //         const searchInput = document.getElementById("searchInput");
// //         searchInput.addEventListener("keypress", async function(event) {
// //             if (event.key === "Enter") {
// //                 event.preventDefault();
                
// //                 const searchQuery = searchInput.value.trim();
                
// //                 if (searchQuery) {
// //                     try {
// //                         const authToken = getCookieValue("access_token"); 
// //                         if (!authToken) {
// //                             console.error('No authentication token found');
// //                             return;
// //                         }
// //                         const response = await fetch(`/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
// //                             method: 'GET',
// //                             headers: {
// //                                 'Authorization': `Bearer ${authToken}`,
// //                                 'Content-Type': 'application/json'
// //                             }
// //                         });
                        
// //                         if (!response.ok) {
// //                             throw new Error('Search request failed');
// //                         }
                        
// //                         const data = await response.json();
// //                         console.log("HEEEERE", data);
// //                         if (data.State === true) {
// //                             handleSearchResults(data.Users);
// //                         } else {
// //                             console.error('Search error:', data);
// //                         }
// //                     } catch (error) {
// //                         console.error('Error during search:', error);
// //                     }
// //                 }
// //             }
// //         });
// //     }
// // }

// // // Function to handle search results
// // function handleSearchResults(users) {
// //     console.log('User found:', users);
// //     // Create or clear the search results container
// //     let searchResultsContainer = document.getElementById("searchResultsContainer");
    
// //     if (!searchResultsContainer) {
// //         // If the container doesn't exist, create it
// //         searchResultsContainer = document.createElement("div");
// //         searchResultsContainer.id = "searchResultsContainer";
// //         searchResultsContainer.className = "search-results-container";
        
// //         // Position it below the search bar
// //         const searchBar = document.querySelector(".search-bar");
// //         if (searchBar) {
// //             searchBar.parentNode.insertBefore(searchResultsContainer, searchBar.nextSibling);
// //         }
// //     } else {
// //         // If it exists, clear its contents
// //         searchResultsContainer.innerHTML = "";
// //     }
    
// //     // Style the container to match dark theme with a fixed width
// //     searchResultsContainer.style.position = "absolute";
// //     searchResultsContainer.style.top = "60px"; 
// //     searchResultsContainer.style.left = "50%";
// //     searchResultsContainer.style.transform = "translateX(-53%)"; // Center it
// //     searchResultsContainer.style.width = "400px"; // Fixed width
// //     searchResultsContainer.style.backgroundColor = "#1f1216"; // Dark background matching theme
// //     searchResultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.5)";
// //     searchResultsContainer.style.borderRadius = "4px";
// //     searchResultsContainer.style.zIndex = "1000";
// //     searchResultsContainer.style.maxHeight = "300px";
// //     searchResultsContainer.style.overflowY = "auto";
// //     searchResultsContainer.style.border = "1px solid #3d232b"; // Accent color border
    
// //     // Add results or "No user found" message
// //     if (users && users.length > 0) {
// //         users.forEach(user => {
// //             const userElement = document.createElement("div");
// //             userElement.className = "user-result";
// //             userElement.style.display = "flex";
// //             userElement.style.alignItems = "center";
// //             userElement.style.padding = "10px";
// //             userElement.style.cursor = "pointer";
// //             userElement.style.borderBottom = "1px solid #3a1f1f"; // Darker border to match theme
// //             userElement.style.color = "#e6e6e6"; // Light text for dark background
            
// //             // Hover effect
// //             userElement.onmouseenter = function() {
// //                 this.style.backgroundColor = "#c8465f"; // Slightly lighter on hover
// //             };
// //             userElement.onmouseleave = function() {
// //                 this.style.backgroundColor = "transparent";
// //             };
            
// //             userElement.innerHTML = `
// //                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
// //                         style="width: 32px; height: 32px; border-radius: 5px; margin-right: 10px;">
// //                 <span>${user.username}</span>
// //             `;
            
// //             // Add click event to show the user profile popup
// //             userElement.addEventListener("click", () => {
// //                 showUserProfilePopup(user);
// //             });
            
// //             searchResultsContainer.appendChild(userElement);
// //         });
// //     } else {
// //         const noResultsElement = document.createElement("div");
// //         noResultsElement.className = "no-results";
// //         noResultsElement.textContent = "No user found";
// //         noResultsElement.style.padding = "15px";
// //         noResultsElement.style.textAlign = "center";
// //         noResultsElement.style.color = "#e74c6b"; // Using accent color for the message
        
// //         searchResultsContainer.appendChild(noResultsElement);
// //     }
    
// //     // Add click event to close results when clicking outside
// //     document.addEventListener("click", function(event) {
// //         if (!searchResultsContainer.contains(event.target) && 
// //             !document.querySelector(".search-bar").contains(event.target)) {
// //             searchResultsContainer.style.display = "none";
// //         }
// //     });
    
// //     // Show the results container
// //     searchResultsContainer.style.display = "block";
// // }

// // // Function to display user profile popup
// // function showUserProfilePopup(user) {
// //     // Remove any existing popup
// //     const existingPopup = document.getElementById("userProfilePopup");
// //     if (existingPopup) {
// //         document.body.removeChild(existingPopup);
// //     }
    
// //     // Create the popup container
// //     const popup = document.createElement("div");
// //     popup.id = "userProfilePopup";
// //     popup.style.position = "fixed";
// //     popup.style.top = "50%";
// //     popup.style.left = "50%";
// //     popup.style.transform = "translate(-50%, -50%)";
// //     popup.style.backgroundColor = "#1a0f14"; // Dark background like the profile page
// //     popup.style.padding = "30px";
// //     popup.style.borderRadius = "8px";
// //     popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.5)";
// //     popup.style.zIndex = "2000";
// //     popup.style.width = "700px"; // Increased width
// //     popup.style.maxWidth = "95%";
// //     popup.style.maxHeight = "85vh";
// //     popup.style.overflowY = "auto";
// //     popup.style.color = "#e6d0d6"; // Light text like the profile page
// //     popup.style.border = "1px solid #3d232b"; // Border like other elements
    
// //     // Create the popup content
// //     popup.innerHTML = `
// //         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 1px solid #3d232b; padding-bottom: 10px;">
// //             <h2 style="margin: 0; color: #c8465f; font-size: 28px;">${user.username}'s Profile</h2>
// //             <button class="add-friend" style="background-color: #c8465f; color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 14px;">Add Friend</button>
// //         </div>
        
// //         <div style="display: flex; margin-bottom: 5px; align-items: flex-start;">
// //             <div style="margin-right: 20px;">
// //                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
// //                     style="width: 120px; height: 120px; border-radius: 10%; object-fit: cover; border: 3px solid #3d232b;">
// //             </div>
// //             <div style="flex-grow: 1;">
// //                 <div style="margin-bottom: 15px; background-color: #2a181e; border-radius: 8px; padding: 15px; border: 1px solid #3d232b;">
// //                     <div style="margin-bottom: 17px;">
// //                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Username:</span>
// //                         <span style="color: #e6d0d6;">${user.username}</span>
// //                     </div>
// //                     <div style="margin-bottom: 17px;">
// //                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Full Name:</span>
// //                         <span style="color: #e6d0d6;">${user.full_name || 'Not provided'}</span>
// //                     </div>
// //                     <div>
// //                         <span style="font-weight: bold; color: #c8465f; width: 120px; display: inline-block;">Email:</span>
// //                         <span style="color: #e6d0d6;">${user.email || 'No email provided'}</span>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
        
// //         <div style="margin-bottom: 30px;">
// //             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">Bio</h3>
// //             <p style="margin: 0; color: #a89a9e; padding: 10px; background-color: #2a181e; border-radius: 8px; border: 1px solid #3d232b;">
// //                 ${user.bio || 'This user has not added a bio yet.'}
// //             </p>
// //         </div>
        
// //         <div>
// //             <h3 style="color: #c8465f; font-size: 22px; margin-bottom: 15px; border-bottom: 1px solid #3d232b; padding-bottom: 8px;">
// //                 <i class="fas fa-chart-line"></i> Games Performance
// //             </h3>
// //             <div class="user-stats-container" style="background-color: #2a181e; border-radius: 8px; padding: 20px; border: 1px solid #3d232b;">
// //                 <div style="display: flex;">
// //                     <div style="flex: 1; position: relative;">
// //                         <canvas id="userGamesChart" style="height: 180px;"></canvas>
// //                     </div>
// //                     <div style="flex: 1; padding-left: 20px;">
// //                         <div class="stats-details" style="display: flex; flex-direction: column; height: 100%; justify-content: center;">
// //                             <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
// //                                 <span style="font-weight: bold; color: #a89a9e;">Games Won:</span>
// //                                 <span style="font-size: 20px; color: #61c8b3; font-weight: bold;">${user.games_won || '0'}</span>
// //                             </div>
// //                             <div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">
// //                                 <span style="font-weight: bold; color: #a89a9e;">Games Lost:</span>
// //                                 <span style="font-size: 20px; color: #c8465f; font-weight: bold;">${user.games_lost || '0'}</span>
// //                             </div>
// //                             <div style="display: flex; justify-content: space-between; align-items: center;">
// //                                 <span style="font-weight: bold; color: #a89a9e;">Win Rate:</span>
// //                                 <span style="font-size: 20px; color: #e6d0d6; font-weight: bold;">${
// //                                     user.games_won && (user.games_won + user.games_lost) > 0 
// //                                     ? Math.round((user.games_won / (user.games_won + user.games_lost)) * 100) + '%' 
// //                                     : '0%'
// //                                 }</span>
// //                             </div>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>
// //         </div>
// //     `;
    
// //     // Create overlay background
// //     const overlay = document.createElement("div");
// //     overlay.id = "profileOverlay";
// //     overlay.style.position = "fixed";
// //     overlay.style.top = "0";
// //     overlay.style.left = "0";
// //     overlay.style.width = "100%";
// //     overlay.style.height = "100%";
// //     overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
// //     overlay.style.zIndex = "1999";
    
// //     // Add to document
// //     document.body.appendChild(overlay);
// //     document.body.appendChild(popup);
    
// //     // Close when clicking outside the popup
// //     overlay.addEventListener("click", () => {
// //         document.body.removeChild(popup);
// //         document.body.removeChild(overlay);
// //     });

// //     // Initialize pie chart for games performance
// //     initUserGameChart(user);

// //     // Add friend
// //     const addFriendButton = document.querySelector('.add-friend');

// //     addFriendButton.addEventListener('click', async function() {
// //         try {
// //             // Disable button immediately while waiting for response
// //             addFriendButton.disabled = true;
// //             addFriendButton.style.backgroundColor = "#8a3042"; // Darker color when disabled
            
// //             const token_100 = getCookieValue('access_token');
// //             const response = await fetch(`/api/invitation/send/${user.id}`, {
// //                 method: 'POST',
// //                 headers: {
// //                     'Authorization': `Bearer ${token_100}`,
// //                     'Content-Type': 'application/json'
// //                 },
// //             });
            
// //             if (!response.ok) {
// //                 throw new Error('Failed to add friend');
// //             }
            
// //             const data = await response.json();
            
// //             // On success, change to "Pending" instead of re-enabling
// //             addFriendButton.textContent = 'Pending';
            
// //         } catch (error) {
// //             console.error('Error adding friend:', error);
// //             addFriendButton.disabled = false;
// //             addFriendButton.style.backgroundColor = "#c8465f"; // Reset color
// //         }
// //     });

// //     fetchRelation(user.id);
// //     // fetchUserGameStats(user.id);
// // }

// // // Function to initialize the pie chart for user games
// // function initUserGameChart(user) {
// //     try {
// //         const chartCanvas = document.getElementById('userGamesChart');
        
// //         if (chartCanvas) {
// //             const ctx = chartCanvas.getContext('2d');
            
// //             if (ctx) {
// //                 const wonGames = user.games_won || 0;
// //                 const lostGames = user.games_lost || 0;
                
// //                 // If we don't have Chart.js loaded, create a placeholder text
// //                 if (typeof Chart === 'undefined') {
// //                     ctx.font = '16px Montserrat';
// //                     ctx.fillStyle = '#e6d0d6';
// //                     ctx.textAlign = 'center';
// //                     ctx.fillText('Chart visualization unavailable', chartCanvas.width/2, chartCanvas.height/2);
// //                     return;
// //                 }
                
// //                 new Chart(ctx, {
// //                     type: 'pie',
// //                     data: {
// //                         labels: ['Won', 'Lost'],
// //                         datasets: [{
// //                             data: [wonGames, lostGames],
// //                             backgroundColor: [
// //                                 '#61c8b3', // Win color - teal
// //                                 '#c8465f'  // Loss color - wine red
// //                             ],
// //                             borderColor: '#1a0f14',
// //                             borderWidth: 2
// //                         }]
// //                     },
// //                     options: {
// //                         responsive: true,
// //                         maintainAspectRatio: false,
// //                         plugins: {
// //                             legend: {
// //                                 position: 'bottom',
// //                                 labels: {
// //                                     color: '#e6d0d6',
// //                                     font: {
// //                                         family: 'Montserrat',
// //                                         size: 12
// //                                     },
// //                                     padding: 10
// //                                 }
// //                             }
// //                         }
// //                     }
// //                 });
// //             }
// //         }
// //     } catch (error) {
// //         console.error('Error initializing user game chart:', error);
// //     }
// // }

// // // Function to fetch user game stats
// // async function fetchUserGameStats(userId) {
// //     try {
// //         const token = getCookieValue('access_token');
        
// //         const response = await fetch(`/api/user/stats/${userId}`, {
// //             method: 'GET',
// //             headers: {
// //                 'Authorization': `Bearer ${token}`,
// //                 'Content-Type': 'application/json'
// //             }
// //         });
        
// //         if (!response.ok) {
// //             throw new Error('Failed to fetch user stats');
// //         }
        
// //         const data = await response.json();
        
// //         if (data.State === true && data.Stats) {
// //             updateUserGameStats(data.Stats);
// //         }
// //     } catch (error) {
// //         console.error('Error fetching user game stats:', error);
// //     }
// // }

// // // Function to update the UI with fetched game stats
// // function updateUserGameStats(stats) {
// //     // Update chart data
// //     const chartCanvas = document.getElementById('userGamesChart');
// //     if (chartCanvas && typeof Chart !== 'undefined') {
// //         const chart = Chart.getChart(chartCanvas);
// //         if (chart) {
// //             chart.data.datasets[0].data = [stats.games_won || 0, stats.games_lost || 0];
// //             chart.update();
// //         }
// //     }
    
// //     // Update stats text
// //     const statsContainer = document.querySelector('.stats-details');
// //     if (statsContainer) {
// //         const statsElements = statsContainer.querySelectorAll('span');
        
// //         // Update Games Won
// //         if (statsElements[1]) statsElements[1].textContent = stats.games_won || '0';
        
// //         // Update Games Lost
// //         if (statsElements[3]) statsElements[3].textContent = stats.games_lost || '0';
        
// //         // Update Win Rate
// //         if (statsElements[5]) {
// //             const winRate = stats.games_won && (stats.games_won + stats.games_lost) > 0 
// //                 ? Math.round((stats.games_won / (stats.games_won + stats.games_lost)) * 100) + '%' 
// //                 : '0%';
// //             statsElements[5].textContent = winRate;
// //         }
// //     }
// // }

// // async function fetchRelation(userId) {
// //     try {
// //         // Disable button immediately while waiting for response
// //         const token_100 = getCookieValue('access_token');
// //         console.log(token_100);
// //         const response = await fetch(`/api/user/relation/${userId}`, {
// //             method: 'GET',
// //             credentials: 'include',
// //             headers: {
// //                 'Authorization': `Bearer ${token_100}`,
// //                 'Content-Type': 'application/json'
// //             },
// //         });
        
// //         if (!response.ok) {
// //             throw new Error('Failed to add friend');
// //         }
        
// //         const data = await response.json();
        
// //         console.log("HEEEREFDGKDSHKJ", data.message);
// //         // On success, change to "Pending" instead of re-enabling
// //         // addFriendButton.textContent = 'Pending';
        
// //     } catch (error) {
// //         console.error('Error adding friend:', error);
// //         // addFriendButton.disabled = false;
// //     }
// // }

// // import { getCookieValue } from "./auth.js";


// // export default function appendHeader() {
// //     const header = document.getElementsByClassName("header")[0];
    
// //     if (header) {
// //         header.innerHTML = `
// //             <div class="logo">ROGUE</div>
// //             <div class="search-bar">
// //                 <i class="fa-solid fa-magnifying-glass"></i>
// //                 <input type="text" placeholder="Search..." id="searchInput">
// //             </div>
// //             <div class="user-controls">
// //                 <div class="notification">
// //                     <i class="fa-solid fa-bell"></i>
// //                     <div class="indicator"></div>
// //                 </div>
// //                 <div class="profile">
// //                     <img src="./resources/adadoun.png" alt="Player Avatar">
// //                 </div>
// //             </div>
// //         `;
        
// //         const searchInput = document.getElementById("searchInput");
// //         searchInput.addEventListener("keypress", async function(event) {
// //             if (event.key === "Enter") {
// //                 event.preventDefault();
                
// //                 const searchQuery = searchInput.value.trim();
                
// //                 if (searchQuery) {
// //                     try {
// //                         const authToken = getCookieValue('access_token'); 
                        
// //                         const response = await fetch(`/api/user/search/?q=${encodeURIComponent(searchQuery)}`, {
// //                             method: 'GET',
// //                             headers: {
// //                                 'Authorization': `Bearer ${authToken}`,
// //                                 'Content-Type': 'application/json'
// //                             }
// //                         });
                        
// //                         if (!response.ok) {
// //                             console.log("EROROOOOOOOR ", response.message);
// //                             throw new Error('Search request failed');
// //                         }
                        
// //                         const data = await response.json();
// //                         console.log(data);
// //                         if (data.State === true) {
// //                             handleSearchResults(data.Users);
// //                         } else {
// //                             console.error('Search error:', data);
// //                         }
// //                     } catch (error) {
// //                         console.error('Error during search:', error);
// //                     }
// //                 }
// //             }
// //         });
// //     }
// // }

// // // Function to handle search results
// // function handleSearchResults(users) {
// //     console.log('User found:', users);
// //     // Create or clear the search results container
// //     let searchResultsContainer = document.getElementById("searchResultsContainer");
    
// //     if (!searchResultsContainer) {
// //         // If the container doesn't exist, create it
// //         searchResultsContainer = document.createElement("div");
// //         searchResultsContainer.id = "searchResultsContainer";
// //         searchResultsContainer.className = "search-results-container";
        
// //         // Position it below the search bar
// //         const searchBar = document.querySelector(".search-bar");
// //         if (searchBar) {
// //             searchBar.parentNode.insertBefore(searchResultsContainer, searchBar.nextSibling);
// //         }
// //     } else {
// //         // If it exists, clear its contents
// //         searchResultsContainer.innerHTML = "";
// //     }
    
// //     // Style the container
// //     searchResultsContainer.style.position = "absolute";
// //     searchResultsContainer.style.top = "60px"; // Adjust based on your header height
// //     searchResultsContainer.style.right = "calc(50% - 125px)"; // Center it below the search bar
// //     searchResultsContainer.style.width = "250px";
// //     searchResultsContainer.style.backgroundColor = "white";
// //     searchResultsContainer.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
// //     searchResultsContainer.style.borderRadius = "4px";
// //     searchResultsContainer.style.zIndex = "1000";
// //     searchResultsContainer.style.maxHeight = "300px";
// //     searchResultsContainer.style.overflowY = "auto";
    
// //     // Add results or "No user found" message
// //     if (users && users.length > 0) {
// //         users.forEach(user => {
// //             const userElement = document.createElement("div");
// //             userElement.className = "user-result";
// //             userElement.style.display = "flex";
// //             userElement.style.alignItems = "center";
// //             userElement.style.padding = "10px";
// //             userElement.style.cursor = "pointer";
// //             userElement.style.borderBottom = "1px solid #eee";
            
// //             userElement.innerHTML = `
// //                 <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
// //                         style="width: 32px; height: 32px; border-radius: 50%; margin-right: 10px;">
// //                 <span>${user.username}</span>
// //             `;
            
// //             // Add click event to show the user profile popup
// //             userElement.addEventListener("click", () => {
// //                 showUserProfilePopup(user);
// //             });
            
// //             searchResultsContainer.appendChild(userElement);
// //         });
// //     } else {
// //         const noResultsElement = document.createElement("div");
// //         noResultsElement.className = "no-results";
// //         noResultsElement.textContent = "No user found";
// //         noResultsElement.style.padding = "15px";
// //         noResultsElement.style.textAlign = "center";
// //         noResultsElement.style.color = "#666";
        
// //         searchResultsContainer.appendChild(noResultsElement);
// //     }
    
// //     // Add click event to close results when clicking outside
// //     document.addEventListener("click", function(event) {
// //         if (!searchResultsContainer.contains(event.target) && 
// //             !document.querySelector(".search-bar").contains(event.target)) {
// //             searchResultsContainer.style.display = "none";
// //         }
// //     });
    
// //     // Show the results container
// //     searchResultsContainer.style.display = "block";
// // }

// // // Function to display user profile popup
// // function showUserProfilePopup(user) {
// //     // Remove any existing popup
// //     const existingPopup = document.getElementById("userProfilePopup");
// //     if (existingPopup) {
// //         document.body.removeChild(existingPopup);
// //     }
    
// //     // Create the popup container
// //     const popup = document.createElement("div");
// //     popup.id = "userProfilePopup";
// //     popup.style.position = "fixed";
// //     popup.style.top = "50%";
// //     popup.style.left = "50%";
// //     popup.style.transform = "translate(-50%, -50%)";
// //     popup.style.backgroundColor = "white";
// //     popup.style.padding = "20px";
// //     popup.style.borderRadius = "8px";
// //     popup.style.boxShadow = "0 5px 15px rgba(0,0,0,0.3)";
// //     popup.style.zIndex = "2000";
// //     popup.style.width = "400px";
// //     popup.style.maxWidth = "90%";
// //     popup.style.maxHeight = "80vh";
// //     popup.style.overflowY = "auto";
    
// //     // Create the popup content
// //     popup.innerHTML = `
// //         <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
// //             <h2 style="margin: 0;">${user.username}'s Profile</h2>
// //             <button id="closePopup" style="background: none; border: none; font-size: 20px; cursor: pointer;">×</button>
// //         </div>
// //         <div style="display: flex; margin-bottom: 20px;">
// //             <img src="${user.avatar || './resources/default.jpg'}" alt="${user.username}" 
// //                 style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
// //             <div style="margin-left: 20px;">
// //                 <p><strong>Username:</strong> ${user.username}</p>
// //                 <p><strong>Full Name:</strong> ${user.full_name || 'Not provided'}</p>
// //                 <p><strong>Email:</strong> ${user.email || 'Not provided'}</p>
// //             </div>
// //         </div>
// //         <div>
// //             <h3>Bio</h3>
// //             <p>${user.bio || 'This user has not added a bio yet.'}</p>
            
// //             <h3>Stats</h3>
            
// //             <div style="margin-top: 20px; text-align: center;">
// //                 <button class="add-friend" style="background-color: #1877f2; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-right: 10px;">Add Friend</button>
// //             </div>
// //         </div>
// //     `;
    
// //     // Create overlay background
// //     const overlay = document.createElement("div");
// //     overlay.id = "profileOverlay";
// //     overlay.style.position = "fixed";
// //     overlay.style.top = "0";
// //     overlay.style.left = "0";
// //     overlay.style.width = "100%";
// //     overlay.style.height = "100%";
// //     overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
// //     overlay.style.zIndex = "1999";
    
// //     // Add to document
// //     document.body.appendChild(overlay);
// //     document.body.appendChild(popup);
    
// //     // Add close functionality
// //     document.getElementById("closePopup").addEventListener("click", () => {
// //         document.body.removeChild(popup);
// //         document.body.removeChild(overlay);
// //     });
    
// //     // Close when clicking outside the popup
// //     overlay.addEventListener("click", () => {
// //         document.body.removeChild(popup);
// //         document.body.removeChild(overlay);
// //     });


// //     //Add friend
// //     const addFriendButton = document.querySelector('.add-friend');

// //     addFriendButton.addEventListener('click', async function() {
// //     try {
// //         // Disable button immediately while waiting for response
// //         addFriendButton.disabled = true;
// //         const token_100 = getCookieValue('access_token');
// //         console.log(token_100);
// //         const response = await fetch(`/api/invitation/send/${user.id}`, {
// //             method: 'POST',
// //             headers: {
// //                 'Authorization': `Bearer ${token_100}`,
// //                 'Content-Type': 'application/json'
// //             },
// //         });
        
// //         if (!response.ok) {
// //             throw new Error('Failed to add friend');
// //         }
        
// //         const data = await response.json();
        
// //         // On success, change to "Pending" instead of re-enabling
// //         addFriendButton.textContent = 'Pending';
        
// //     } catch (error) {
// //         console.error('Error adding friend:', error);
// //         addFriendButton.disabled = false;
// //     }
// //     });

// //     fetchRelation(user.id);
// //     console.log("After button");
// // }

// // async function fetchRelation(userId) {
// //     try {
// //         // Disable button immediately while waiting for response
// //         const token_100 = getCookieValue('access_token');
// //         console.log(token_100);
// //         const response = await fetch(`/api/user/relation/${userId}`, {
// //             method: 'GET',
// //             credentials: 'include',
// //             headers: {
// //                 'Authorization': `Bearer ${token_100}`,
// //                 'Content-Type': 'application/json'
// //             },
// //         });
        
// //         if (!response.ok) {
// //             throw new Error('Failed to add friend');
// //         }
        
// //         const data = await response.json();
        
// //         console.log("HEEEREFDGKDSHKJ", data.message);
// //         // On success, change to "Pending" instead of re-enabling
// //         // addFriendButton.textContent = 'Pending';
        
// //     } catch (error) {
// //         console.error('Error adding friend:', error);
// //         // addFriendButton.disabled = false;
// //     }
// // }
