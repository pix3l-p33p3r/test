import { getCookieValue, setProfileImage } from "../jsUtils/auth.js";

const app = document.getElementById("app");

function displayFriends() {
    app.innerHTML = `
    <section class="friends">
        <!-- HEADER CONTAINER -->
        <header class="header"></header>      
        <!-- MAIN CONTAINER WITH SIDEBAR AND CONTENT -->
        <div class="main-container">

            <!-- 2. LEFT SIDEBAR -->
            <div class="left-sidebar"></div>

            <!-- 3. MAIN CONTENT AREA -->
            <div class="content">
                  <div class="friends-container">
    <!-- Friends List Section -->
    <div class="friends-list card">
      <h2 class="section-title">Friends</h2>
      
      <!-- Friend Cards -->
      
      <!-- <div class="friend-card">
        <img src="/static/resources/adadoun.png" alt="Friend profile">
        <div class="friend-info">
          <div class="friend-name">ADMIN ADMIN</div>
        </div>
        <button class="unfriend-btn">Unfriend</button>
      </div>
      
      <div class="friend-card">
        <img src="/static/resources/adadoun.png" alt="Friend profile">
        <div class="friend-info">
          <div class="friend-name">Admin Admin</div>
        </div>
        <button class="unfriend-btn">Unfriend</button>
      </div> -->
      
    </div>
    
    <!-- Friend Requests Section -->
    <div class="friend-requests card">
      <h2 class="section-title">Friend Requests</h2>
      
      <!-- Request Cards -->
    </div>
  </div>
            </div>

        </div>
    </section>
    `;
    document.title = 'Friends';
    fetchUserInvitations();
    fetchUserFriends();
    // Move the event handlers here, AFTER the HTML has been added to the DOM
}


async function fetchUserInvitations() {
  try {
    const token = getCookieValue('access_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await fetch('/api/invitation/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log("Error with response:", response);
      throw new Error('Failed to fetch invitations');
    }
    
    const responseData = await response.json();
    console.log("Invitations response:", responseData);
    
    // Get the invitations array from the response
    const invitationsList = responseData.Invitations || [];
    
    // Get the container
    const requestsContainer = document.querySelector('.friend-requests');
    
    // Clear existing content except the title
    const sectionTitle = requestsContainer.querySelector('.section-title');
    requestsContainer.innerHTML = '';
    requestsContainer.appendChild(sectionTitle);
    
    // Check if there are invitations
    if (invitationsList && invitationsList.length > 0) {
      // Loop through invitations and create elements
      invitationsList.forEach(invitation => {
        // Extract sender information from the invitation object
        const sender = invitation.sender;
        
        const requestCard = document.createElement('div');
        requestCard.className = 'request-card';
        // You may need to adjust if your invitation has its own ID
        requestCard.dataset.invitationSenderId = sender.id;
        //Detect image
        let imageTemp;
    
        if (sender.uploaded_image) {
            console.log('' + sender.uploaded_image);
            imageTemp = '' + sender.uploaded_image;
        } else if (sender.image_url) {
            console.log(sender.image_url);
            imageTemp = sender.image_url;
        } else {
            imageTemp = '/static/resources/default.jpg';
        }
        
        requestCard.innerHTML = `
          <img src="${imageTemp}" alt="Request profile">
          <div class="request-info">
            <div class="request-name">${sender.username || 'Unknown User'}</div>
          </div>
          <div class="request-actions">
            <button class="accept-btn"><i class="fas fa-check"></i></button>
            <button class="decline-btn"><i class="fas fa-trash"></i></button>
          </div>
        `;
        
        requestsContainer.appendChild(requestCard);

        const acceptBtn = requestCard.querySelector('.accept-btn');
        const declineBtn = requestCard.querySelector('.decline-btn');
        
        acceptBtn.addEventListener('click', () => handleAcceptInvitation(sender.id));
        declineBtn.addEventListener('click', () => handleDeclineInvitation(sender.id));
      });
    } else {
      // No invitations found
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <i class="fas fa-user-friends"></i>
        <p>No invitation requests for now.</p>
      `;
      requestsContainer.appendChild(emptyState);
    }
  } catch (error) {
    console.error('Error fetching user invitations:', error);
    
    // Show error state
    const requestsContainer = document.querySelector('.friend-requests');
    const sectionTitle = requestsContainer.querySelector('.section-title');
    requestsContainer.innerHTML = '';
    requestsContainer.appendChild(sectionTitle);
    
    const errorState = document.createElement('div');
    errorState.className = 'empty-state';
    errorState.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load invitation requests. Please try again later.</p>
    `;
    requestsContainer.appendChild(errorState);
  }
}

async function handleAcceptInvitation(invitationId) {
  try {
    const token = getCookieValue('access_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await fetch(`/api/invitation/accept/${invitationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to accept invitation');
    }
    console.log(response.message);
    // Refresh data after accepting
    fetchUserInvitations();
    fetchUserFriends();
  } catch (error) {
    console.log('Error accepting invitation:', error);
  }
}

async function handleDeclineInvitation(invitationId) {
  try {
    const token = getCookieValue('access_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await fetch(`/api/invitation/reject/${invitationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to decline invitation');
    }
    
    // Refresh invitations after declining
    fetchUserInvitations();
  } catch (error) {
    console.error('Error declining invitation:', error);
  }
}

// Functions to handle button actions
async function fetchUserFriends() {
  try {
    const token = getCookieValue('access_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await fetch('/api/friend/list', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log("Error with response:", response);
      throw new Error('Failed to fetch friends');
    }
    
    const data = await response.json();
    
    const friendsList = data.Friends;

    console.log("Friends response:", friendsList);

    //Managing the response
    const friendsContainer = document.querySelector('.friends-list');
    
    const sectionTitle = friendsContainer.querySelector('.section-title');
    friendsContainer.innerHTML = '';
    friendsContainer.appendChild(sectionTitle);
    
    
    if (friendsList && friendsList.length > 0) {
      
      friendsList.forEach(item => {

        const friend = item.friend;
        const friendCard = document.createElement('div');
        friendCard.className = 'friend-card';
        friendCard.dataset.friendId = friend.id;
        
        let imageTemp;
    
        if (friend.uploaded_image) {
            console.log('' + friend.uploaded_image);
            imageTemp = '' + friend.uploaded_image;
        } else if (friend.image_url) {
            console.log(friend.image_url);
            imageTemp = friend.image_url;
        } else {
            imageTemp = '/static/resources/default.jpg';
        }

        const profilePic = imageTemp;
        
        
        let fullNameHtml = '';
        if (friend.first_name && friend.last_name) {
          const fullName = friend
          fullNameHtml = `<div class="friend-fullname">${fullName}</div>`;
        }
        
        friendCard.innerHTML = `
          <img src="${profilePic}" alt="${friend.username}'s profile">
          <div class="friend-info">
            <div class="friend-name">${friend.username || 'Unknown User'}</div>
            ${fullNameHtml}
          </div>
          <button class="unfriend-btn">Unfriend</button>
        `;
        
        friendsContainer.appendChild(friendCard);
        
        // Add event listener to unfriend button
        const unfriendBtn = friendCard.querySelector('.unfriend-btn');
        unfriendBtn.addEventListener('click', () => handleUnfriend(friend.id));
      });
    } else {
      // No friends found
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-state';
      emptyState.innerHTML = `
        <i class="fas fa-user-friends"></i>
        <p>You don't have any friends yet.</p>
      `;
      friendsContainer.appendChild(emptyState);
    }
  } catch (error) {
    console.error('Error fetching friends:', error);
    
    // Show error state
    const friendsContainer = document.querySelector('.friends-list');
    const sectionTitle = friendsContainer.querySelector('.section-title');
    friendsContainer.innerHTML = '';
    friendsContainer.appendChild(sectionTitle);
    
    const errorState = document.createElement('div');
    errorState.className = 'empty-state';
    errorState.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <p>Failed to load friends. Please try again later.</p>
    `;
    friendsContainer.appendChild(errorState);
  }
}


async function handleUnfriend(friendId) {
  try {
    const token = getCookieValue('access_token');
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    const response = await fetch(`/api/friend/remove/${friendId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to unfriend user');
    }
    
    // Refresh friends list after unfriending
    fetchUserFriends();
  } catch (error) {
    console.error('Error unfriending user:', error);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  displayFriends();
});

export default displayFriends;
