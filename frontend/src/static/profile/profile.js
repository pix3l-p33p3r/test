import { setProfileImage, getCookieValue } from "../jsUtils/auth.js";

const app = document.getElementById("app");

function displayProfile() {
    app.innerHTML = `
    <section class="profile">
        <!-- HEADER CONTAINER -->
        <header class="header"></header> 
        <!-- MAIN CONTAINER WITH SIDEBAR AND CONTENT -->
        <div class="main-container">
            <!-- 2. LEFT SIDEBAR -->
            <div class="left-sidebar">

            </div>

            <!-- 3. MAIN CONTENT AREA -->
            <div class="content">
                <!-- Combined Profile & Settings Page -->
                <div id="profile-combined" class="profile-section active">
                    <div class="profile-box">
                        <div class="profile-header">
                            <h2>Profile & Settings</h2>
                            <button class="delete-profile-btn"><i class="fas fa-trash"></i> Delete Profile</button>
                        </div>
                        <div class="profile-content">
                            <!-- Profile Picture Section -->
                            <div class="profile-picture-container">
                                <div class="profile-picture">
                                    <img id="profile-image" alt="Player Avatar">
                                    <input type="file" id="image-input" accept="image/jpeg, image/png, image/jpg" style="display: none;">
                                    <div class="change-photo">
                                        <i class="fas fa-camera"></i>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- User Info Section -->
                            <div class="section-container">
                                <h3 class="section-title">User Information</h3>
                                <div class="section-content">
                                    <!-- Name and Username on same line -->
                                    <div class="profile-field-row">
                                        <div class="profile-field">
                                            <label>Full Name</label>
                                            <input type="text" id="fullName" value="Loading..." disabled>
                                        </div>
                                        <div class="profile-field">
                                            <label>Username</label>
                                            <input type="text" id="username" value="Loading..." disabled>
                                        </div>
                                    </div>
                                    
                                    <!-- Bio on separate line -->
                                    <div class="profile-field">
                                        <label>Bio</label>
                                        <textarea placeholder="Write you bio here" id="bio" disabled>Loading...</textarea>
                                    </div>
                                    
                                    <div class="profile-actions">
                                        <button class="edit-info-btn"><i class="fas fa-edit"></i> Edit Info</button>
                                        <button class="save-info-btn" style="display: none;"><i class="fas fa-save"></i> Save Info</button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Security Section -->
                            <div class="section-container">
                                <h3 class="section-title">Security Settings</h3>
                                <div class="security-content">
                                    <div class="security-container">
                                        <!-- Email and Password Section -->
                                        <div class="credentials-section">
                                            <div class="profile-field">
                                                <label>Email</label>
                                                <div class="credential-display">
                                                    <input type="email" id="email" value="Loading..." disabled>
                                                    <button class="change-btn" data-target="email"><i class="fas fa-pencil-alt"></i> Change</button>
                                                </div>
                                            </div>
                                            
                                            <div class="profile-field">
                                                <label>Password</label>
                                                <div class="credential-display">
                                                    <input type="password" value="••••••••" disabled>
                                                    <button class="change-btn" data-target="password"><i class="fas fa-pencil-alt"></i> Change</button>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- 2FA Section to the right -->
                                        <!--<div class="twofa-section">
                                            <div class="twofa-header">
                                                <h4>Two-Factor Authentication</h4>
                                                <div class="twofa-status">
                                                    <span class="status-indicator disabled"></span>
                                                    <span class="status-text">Disabled</span>
                                                </div>
                                            </div>
                                            <p class="twofa-description">
                                                Add an extra layer of security to your account by enabling two-factor authentication.
                                            </p>
                                            <button class="enable-twofa-btn"><i class="fas fa-shield-alt"></i> Enable 2FA</button>
                                        </div>-->
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Email Change Modal (Hidden by default) -->
                <div id="email-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h3>Change Email</h3>
                        <div class="modal-body">
                            <div class="profile-field">
                                <label>Current Email</label>
                                <input type="email" id="current-email" value="" disabled>
                            </div>
                            <div class="profile-field">
                                <label>New Email</label>
                                <input type="email" id="new-email">
                            </div>
                            <div class="error-message2"></div>
                            <div class="modal-actions">
                                <button class="cancel-btn">Cancel</button>
                                <button class="save-email-btn">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Password Change Modal (Hidden by default) -->
                <div id="password-modal" class="modal">
                    <div class="modal-content">
                        <span class="close-modal">&times;</span>
                        <h3>Change Password</h3>
                        <div class="modal-body">
                            <div class="profile-field">
                                <label>Current Password</label>
                                <input type="password" id="current-password">
                            </div>
                            <div class="profile-field">
                                <label>New Password</label>
                                <input type="password" id="new-password">
                            </div>
                            <div class="profile-field">
                                <label>Confirm New Password</label>
                                <input type="password" id="confirm-new-password">
                            </div>
                            <div class="error-message3"></div>
                            <div class="modal-actions">
                                <button class="cancel-btn">Cancel</button>
                                <button class="save-password-btn">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;

    document.title = 'Profile & Settings';
    console.log("PROFILE PAGE");
    // Fetch user data from backend

    fetchUserData();

    // Edit/Save User Info functionality
    const editInfoBtn = document.querySelector('.edit-info-btn');
    const saveInfoBtn = document.querySelector('.save-info-btn');
    const infoInputs = document.querySelectorAll('.section-content input, .section-content textarea');

    editInfoBtn.addEventListener('click', function() {
        infoInputs.forEach(input => {
            input.disabled = false;
            input.focus(); // This will allow focusing on the first input
        });
        editInfoBtn.style.display = 'none';
        saveInfoBtn.style.display = 'flex';
    });

    // Updated save button event listener
    saveInfoBtn.addEventListener('click', async function() {
        // Get updated values
        const updatedData = {
                username: document.getElementById('username').value,
                full_name: document.getElementById('fullName').value,
                bio: document.getElementById('bio').value,
        };
    
        // Send data to backend and check response
        const updateSuccess = await updateUserProfile(updatedData);
    
        // Only disable inputs and change button visibility if update was successful
        if (updateSuccess) {
            infoInputs.forEach(input => input.disabled = true);
            saveInfoBtn.style.display = 'none';
            editInfoBtn.style.display = 'flex';
        }
    });
    
    
    let profilePic = document.getElementById('profile-image');
    let inputFile = document.getElementById('image-input');
    const changePhotoButton = document.querySelector('.change-photo');

    // Trigger file input when clicking on the camera icon
    changePhotoButton.addEventListener('click', function() {
        inputFile.click();
    });

    // Handle file selection and display preview
    inputFile.onchange = function() {
        if (inputFile.files.length > 0) {
            // Create a preview using URL.createObjectURL
            profilePic.src = URL.createObjectURL(inputFile.files[0]);
            // Upload to server
            uploadProfileImage(inputFile.files[0]);
        }
    };

    // Modal functionality for Email and Password changes
    const emailModal = document.getElementById('email-modal');
    const passwordModal = document.getElementById('password-modal');
    const changeButtons = document.querySelectorAll('.change-btn');
    const closeButtons = document.querySelectorAll('.close-modal, .cancel-btn');

    // Modal control functions
    function openModal(modalElement) {
        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);
        
        // Show modal
        modalElement.style.display = 'flex';
    }

    function closeModal() {
        // Hide all modals
        emailModal.style.display = 'none';
        passwordModal.style.display = 'none';
        
        // Remove overlay
        const overlay = document.querySelector('.modal-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
    }

    // Open the appropriate modal
    changeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            if (target === 'email') {
                // Set current email in the modal
                document.getElementById('current-email').value = document.getElementById('email').value;
                openModal(emailModal);
            } else if (target === 'password') {
                openModal(passwordModal);
            }
        });
    });

    // Close any open modal
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeModal();
        });
    });

    // Close when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === emailModal || event.target === passwordModal) {
            closeModal();
        }
    });
    
    // Updated save email button event listener
    document.querySelector('.save-email-btn').addEventListener('click', async function() {
        const newEmail = document.getElementById('new-email').value;
    
        // Update email on backend and check response
        const updateSuccess = await updateEmail(newEmail);
    
        // Only close modal if update was successful
        if (updateSuccess) {
            emailModal.style.display = 'none';
        }
    });
    
    // Updated save password button event listener
    document.querySelector('.save-password-btn').addEventListener('click', async function() {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
    
        // Update password on backend and check response
        const updateSuccess = await updatePassword(currentPassword, newPassword, confirmPassword);
    
        // Only close modal if update was successful
        if (updateSuccess) {
            passwordModal.style.display = 'none';
        }
    });
    
    //Delete Profile
    const deleteProfileBtn = document.getElementsByClassName('delete-profile-btn');
    deleteProfileBtn[0].addEventListener('click', function() {
            deleteUserProfile();
    });
}


// Function to fetch user data from backend
async function fetchUserData() {
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

        console.log(userData);
        // Update UI with fetched data
        document.getElementById('username').value = userData.user.username || 'Default';
        document.getElementById('fullName').value = userData.user.full_name || 'Default';
        document.getElementById('bio').value = userData.user.bio || '';
        document.getElementById('email').value = userData.user.email || 'Default';
        
        let imageTemp;
    
        if (userData.user.uploaded_image) {
            imageTemp = userData.user.uploaded_image;//After Nginex spoiler
        } else if (userData.user.image_url) {
            imageTemp = userData.user.image_url;
        } else {
            imageTemp = '/static/resources/default.jpg';
        }
        
        document.getElementById('profile-image').src = imageTemp;

    } catch (error) {
        console.error('Error fetching user data:', error);
        console.log('Failed to load user data. Please try again later.');

        // alert('Failed to load user data. Please try again later.');
    }
}

async function uploadProfileImage(imageFile) {
    try {
        const token = getCookieValue('access_token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Create FormData object to send the file
        const formData = new FormData();
        formData.append('uploaded_image', imageFile);
        
        // Send the file to the backend
        const response = await fetch('/api/user/update/', {
            method: 'PUT', 
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to upload profile image');
        }
        const result = await response.json();
        if (response.ok){
            document.getElementById('profile-image').src = result.uploaded_image;
            setTimeout(() => {
                fetchUserData();
            }, 1000);
    }

    } catch (error) {
        console.error('Error uploading profile image:', error);
        // alert('Failed to upload profile image. Please try again later.');
    }
}


// Function to update user profile
// Function to update user profile with error handling
async function updateUserProfile(userData) {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Send updated data to API
        console.log("update = ", userData);
        const response = await fetch('/api/user/update/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            // Create error message element if it doesn't exist
            let errorMessage = document.querySelector('.profile-error-message');
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'profile-error-message';
                document.querySelector('.profile-actions').appendChild(errorMessage);
            }
            
            errorMessage.textContent = 'Failed to update profile information. Please check your input and try again.';
            errorMessage.style.color = 'red';
            errorMessage.style.marginBottom = '10px';
            
            // Don't disable inputs - keep them editable so user can fix the issue
            return false;
        }
        
        // If successful, continue with existing code
        const result = await response.json();
        console.log(result.text);
        console.log('Profile updated successfully!');
        
        // Clear any error messages if they exist
        const errorMessage = document.querySelector('.profile-error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        return true;
    } catch (error) {
        console.error('Error updating profile:', error);
        return false;
    }
}

// Function to update email with error handling
async function updateEmail(newEmail) {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        // Send email update to API
        const response = await fetch('/api/user/update/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: newEmail
            })
        });
        
        if (!response.ok) {
            // Display error message in the modal
            let errorMessage = document.querySelector('#email-modal .modal-error');
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'modal-error';
                document.querySelector('#email-modal .modal-actions').before(errorMessage);
            }
            
            errorMessage.textContent = 'Failed to update email. Please check your input and try again.';
            errorMessage.style.color = 'red';
            errorMessage.style.marginTop = '10px';
            
            return false;
        }
        
        const result = await response.json();
        document.getElementById('email').value = newEmail;
        
        // Clear any error messages if they exist
        const errorMessage = document.querySelector('#email-modal .modal-error');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        return true;
    } catch (error) {
        console.error('Error updating email:', error);
        return false;
    }
}

// Function to update password with error handling
async function updatePassword(currentPassword, newPassword, confirmPassword) {
    try {
        // Get token from cookies
        const token = getCookieValue('access_token');

        if (!token) {
            console.error('No authentication token found');
            return false; // Return false if no token
        }
    
        // Send password update to API
        const response = await fetch('/api/user/update/password', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                old_password: currentPassword,
                pass1: newPassword,
                pass2: confirmPassword
            })
        });
        
        if (!response.ok) {
            // Display error message in the modal
            let errorMessage = document.querySelector('#password-modal .modal-error');
            if (!errorMessage) {
                errorMessage = document.createElement('div');
                errorMessage.className = 'modal-error';
                document.querySelector('#password-modal .modal-actions').before(errorMessage);
            }
            
            // Try to get specific error message from response
            const errorData = await response.json();
            const errorText = errorData.error || 'Failed to update password. Please check your input and try again.';
            
            errorMessage.textContent = errorText;
            errorMessage.style.color = 'red';
            errorMessage.style.marginTop = '10px';
            
            return false; // Return false for failure
        }
        
        // Clear any error messages if they exist
        const errorMessage = document.querySelector('#password-modal .modal-error');
        if (errorMessage) {
            errorMessage.remove();
        }
        
        return true; // Return true for success
    } catch (error) {
        console.log('Error updating password:', error);
        
        // Display generic error message in the modal
        let errorMessage = document.querySelector('#password-modal .modal-error');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'modal-error';
            document.querySelector('#password-modal .modal-actions').before(errorMessage);
        }
        
        errorMessage.textContent = 'An error occurred while updating your password. Please try again.';
        errorMessage.style.color = 'red';
        errorMessage.style.marginTop = '10px';
        
        return false; // Return false for exception
    }
}

async function deleteUserProfile() {
    try {
        const token = getCookieValue('access_token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }
        
        const response = await fetch('/api/delete-profile/', {
            method: 'DELETE',
            credentials: "include",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete profile');
        }
        
        // Handle successful deletion
        // alert('Profile deleted successfully. You will be redirected to the login page.');
        // Clear cookies/tokens
        document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Redirect to login page
        window.location.hash = 'login';

        
    } catch (error) {
        console.error('Error deleting profile:', error);
        alert('Failed to delete profile. Please try again later.');
    }
}

// Call the function when the document is loaded
document.addEventListener('DOMContentLoaded', function() {
    displayProfile();
});

export default displayProfile;
// import { setProfileImage, getCookieValue } from "../jsUtils/auth.js";

// const app = document.getElementById("app");

// function displayProfile() {
//     app.innerHTML = `
//     <section class="profile">
//         <!-- HEADER CONTAINER -->
//         <header class="header"></header> 
//         <!-- MAIN CONTAINER WITH SIDEBAR AND CONTENT -->
//         <div class="main-container">
//             <!-- 2. LEFT SIDEBAR -->
//             <div class="left-sidebar">

//             </div>

//             <!-- 3. MAIN CONTENT AREA -->
//             <div class="content">
//                 <!-- Combined Profile & Settings Page -->
//                 <div id="profile-combined" class="profile-section active">
//                     <div class="profile-box">
//                         <div class="profile-header">
//                             <h2>Profile & Settings</h2>
//                             <button class="delete-profile-btn"><i class="fas fa-trash"></i> Delete Profile</button>
//                         </div>
//                         <div class="profile-content">
//                             <!-- Profile Picture Section -->
//                             <div class="profile-picture-container">
//                                 <div class="profile-picture">
//                                     <img id="profile-image" alt="Player Avatar">
//                                     <input type="file" id="image-input" accept="image/jpeg, image/png, image/jpg" style="display: none;">
//                                     <div class="change-photo">
//                                         <i class="fas fa-camera"></i>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <!-- User Info Section -->
//                             <div class="section-container">
//                                 <h3 class="section-title">User Information</h3>
//                                 <div class="section-content">
//                                     <!-- Name and Username on same line -->
//                                     <div class="profile-field-row">
//                                         <div class="profile-field">
//                                             <label>Full Name</label>
//                                             <input type="text" id="fullName" value="Loading..." disabled>
//                                         </div>
//                                         <div class="profile-field">
//                                             <label>Username</label>
//                                             <input type="text" id="username" value="Loading..." disabled>
//                                         </div>
//                                     </div>
                                    
//                                     <!-- Bio on separate line -->
//                                     <div class="profile-field">
//                                         <label>Bio</label>
//                                         <textarea placeholder="Write you bio here" id="bio" disabled>Loading...</textarea>
//                                     </div>
                                    
//                                     <div class="profile-actions">
//                                         <button class="edit-info-btn"><i class="fas fa-edit"></i> Edit Info</button>
//                                         <button class="save-info-btn" style="display: none;"><i class="fas fa-save"></i> Save Info</button>
//                                     </div>
//                                 </div>
//                             </div>
                            
//                             <!-- Security Section -->
//                             <div class="section-container">
//                                 <h3 class="section-title">Security Settings</h3>
//                                 <div class="security-content">
//                                     <div class="security-container">
//                                         <!-- Email and Password Section -->
//                                         <div class="credentials-section">
//                                             <div class="profile-field">
//                                                 <label>Email</label>
//                                                 <div class="credential-display">
//                                                     <input type="email" id="email" value="Loading..." disabled>
//                                                     <button class="change-btn" data-target="email"><i class="fas fa-pencil-alt"></i> Change</button>
//                                                 </div>
//                                             </div>
                                            
//                                             <div class="profile-field">
//                                                 <label>Password</label>
//                                                 <div class="credential-display">
//                                                     <input type="password" value="••••••••" disabled>
//                                                     <button class="change-btn" data-target="password"><i class="fas fa-pencil-alt"></i> Change</button>
//                                                 </div>
//                                             </div>
//                                         </div>
                                        
//                                         <!-- 2FA Section to the right -->
//                                         <div class="twofa-section">
//                                             <div class="twofa-header">
//                                                 <h4>Two-Factor Authentication</h4>
//                                                 <div class="twofa-status">
//                                                     <span class="status-indicator disabled"></span>
//                                                     <span class="status-text">Disabled</span>
//                                                 </div>
//                                             </div>
//                                             <p class="twofa-description">
//                                                 Add an extra layer of security to your account by enabling two-factor authentication.
//                                             </p>
//                                             <button class="enable-twofa-btn"><i class="fas fa-shield-alt"></i> Enable 2FA</button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
                
//                 <!-- Email Change Modal (Hidden by default) -->
//                 <div id="email-modal" class="modal">
//                     <div class="modal-content">
//                         <span class="close-modal">&times;</span>
//                         <h3>Change Email</h3>
//                         <div class="modal-body">
//                             <div class="profile-field">
//                                 <label>Current Email</label>
//                                 <input type="email" id="current-email" value="" disabled>
//                             </div>
//                             <div class="profile-field">
//                                 <label>New Email</label>
//                                 <input type="email" id="new-email">
//                             </div>
                            
//                             <div class="modal-actions">
//                                 <button class="cancel-btn">Cancel</button>
//                                 <button class="save-email-btn">Save Changes</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
                
//                 <!-- Password Change Modal (Hidden by default) -->
//                 <div id="password-modal" class="modal">
//                     <div class="modal-content">
//                         <span class="close-modal">&times;</span>
//                         <h3>Change Password</h3>
//                         <div class="modal-body">
//                             <div class="profile-field">
//                                 <label>Current Password</label>
//                                 <input type="password" id="current-password">
//                             </div>
//                             <div class="profile-field">
//                                 <label>New Password</label>
//                                 <input type="password" id="new-password">
//                             </div>
//                             <div class="profile-field">
//                                 <label>Confirm New Password</label>
//                                 <input type="password" id="confirm-new-password">
//                             </div>
//                             <div class="modal-actions">
//                                 <button class="cancel-btn">Cancel</button>
//                                 <button class="save-password-btn">Save Changes</button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     </section>
//     `;

//     document.title = 'Profile & Settings';
//     console.log("PROFILE PAGE");
//     // Fetch user data from backend

//     fetchUserData();

//     // Edit/Save User Info functionality
//     const editInfoBtn = document.querySelector('.edit-info-btn');
//     const saveInfoBtn = document.querySelector('.save-info-btn');
//     const infoInputs = document.querySelectorAll('.section-content input, .section-content textarea');

//     editInfoBtn.addEventListener('click', function() {
//         infoInputs.forEach(input => {
//             input.disabled = false;
//             input.focus(); // This will allow focusing on the first input
//         });
//         console.log("Edit mode enabled");
//         editInfoBtn.style.display = 'none';
//         saveInfoBtn.style.display = 'flex';
//     });

//     saveInfoBtn.addEventListener('click', function() {
//         // Get updated values
//         const updatedData = {
//                 username: document.getElementById('username').value,
//                 full_name: document.getElementById('fullName').value, // Note: using full_name to match the incoming data
//                 bio: document.getElementById('bio').value,
//         };
        
//         // Send data to backend
//         updateUserProfile(updatedData);
        
//         // Disable inputs
//         infoInputs.forEach(input => input.disabled = true);
//         saveInfoBtn.style.display = 'none';
//         editInfoBtn.style.display = 'flex';
//     });
    
    
//     let profilePic = document.getElementById('profile-image');
//     let inputFile = document.getElementById('image-input');
//     const changePhotoButton = document.querySelector('.change-photo');

//     // Trigger file input when clicking on the camera icon
//     changePhotoButton.addEventListener('click', function() {
//         inputFile.click();
//     });

//     // Handle file selection and display preview
//     inputFile.onchange = function() {
//         if (inputFile.files.length > 0) {
//             // Create a preview using URL.createObjectURL
//             profilePic.src = URL.createObjectURL(inputFile.files[0]);
//             console.log("file -> ", inputFile.files[0]);
//             // Upload to server
//             uploadProfileImage(inputFile.files[0]);
//         }
//     };

//     // Modal functionality for Email and Password changes
//     const emailModal = document.getElementById('email-modal');
//     const passwordModal = document.getElementById('password-modal');
//     const changeButtons = document.querySelectorAll('.change-btn');
//     const closeButtons = document.querySelectorAll('.close-modal, .cancel-btn');
    
//     // Open the appropriate modal
//     changeButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             const target = this.getAttribute('data-target');
//             if (target === 'email') {
//                 // Set current email in the modal
//                 document.getElementById('current-email').value = document.getElementById('email').value;
//                 emailModal.style.display = 'flex';
//             } else if (target === 'password') {
//                 passwordModal.style.display = 'flex';
//             }
//         });
//     });
    
//     // Close any open modal
//     closeButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             emailModal.style.display = 'none';
//             passwordModal.style.display = 'none';
//         });
//     });
    
//     // Close when clicking outside of it
//     window.addEventListener('click', function(event) {
//         if (event.target === emailModal) {
//             emailModal.style.display = 'none';
//         }
//         if (event.target === passwordModal) {
//             passwordModal.style.display = 'none';
//         }
//     });
    
//     // Save email changes
//     document.querySelector('.save-email-btn').addEventListener('click', function() {
//         const newEmail = document.getElementById('new-email').value;
//         // const password = document.getElementById('confirm-password-email').value;
        
//         // Update email on backend
//         updateEmail(newEmail);
        
//         emailModal.style.display = 'none';
//     });
    
//     // Save password changes
//     document.querySelector('.save-password-btn').addEventListener('click', function() {
//         const currentPassword = document.getElementById('current-password').value;
//         const newPassword = document.getElementById('new-password').value;
//         const confirmPassword = document.getElementById('confirm-new-password').value;
        
//         updatePassword(currentPassword, newPassword, confirmPassword);
        
//         passwordModal.style.display = 'none';
//     });
    
//     //Delete Profile
//     const deleteProfileBtn = document.getElementsByClassName('delete-profile-btn');
//     deleteProfileBtn[0].addEventListener('click', function() {
//         if (confirm('Are you sure you want to delete your profile? This action cannot be undone.')) {
//             deleteUserProfile();
//             window.location.hash = "login";
//         }
//     });

//     // Enable 2FA button functionality
//     document.querySelector('.enable-twofa-btn').addEventListener('click', function() {
//         // Here implement 2FA setup
//         alert('2FA setup flow would start here');
//     });
// }

// // Function to fetch user data from backend
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
//             console.log("HEEREEEEEEE", response);
//             throw new Error('Failed to fetch user data');
//         }
//         const userData = await response.json();

//         console.log(userData.user);

//         // Update UI with fetched data
//         document.getElementById('username').value = userData.user.username || 'Default';
//         document.getElementById('fullName').value = userData.user.full_name || 'Default';
//         document.getElementById('bio').value = userData.user.bio || '';
//         document.getElementById('email').value = userData.user.email || 'Default';
        
//         setProfileImage(userData);
//     } catch (error) {
//         console.error('Error fetching user data:', error);
//         console.log('Failed to load user data. Please try again later.');

//         // alert('Failed to load user data. Please try again later.');
//     }
// }

// // Function to update user profile
// async function updateUserProfile(userData) {
//     try {
//         // Get token from cookies
//         const token = getCookieValue('access_token');
        
//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
        
//         // Send updated data to API - Fixed URL with trailing slash
//         console.log("update = ", userData);
//         const response = await fetch('/api/user/update/', {
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(userData)
//         });
        
//         if (!response.ok) {
            
            
//             throw new Error('Failed to update profile');
            
//         }
        
//         const result = await response.json();
//         console.log(result.text);
//         console.log('Profile updated successfully!');
        
//     } catch (error) {
//         console.error('Error updating profile:', error);
//         // alert('Failed to update profile. Please try again later.');
//     }
// }

// // Function to update email
// async function updateEmail(newEmail) {
//     try {
//         // Get token from cookies
//         const token = getCookieValue('access_token');
        
//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
        
//         // Send email update to API
//         const response = await fetch('/api/user/update/', {
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 email : newEmail
//                 // password
//             })
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to update email');
//         }
        
//         const result = await response.json();
//         document.getElementById('email').value = newEmail;
//         alert('Email updated successfully!');
        
//     } catch (error) {
//         console.error('Error updating email:', error);
//         alert('Failed to update email. Please check your password and try again.');
//     }
// }

// // Function to update password
// async function updatePassword(currentPassword, newPassword, confirmPassword) {
//     try {
//         // Get token from cookies
//         const token = getCookieValue('access_token');

//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
    
//         // Send password update to API
//         const response = await fetch('/api/user/update/password', {
//             method: 'PUT',
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({
//                 old_password : currentPassword,
//                 pass1 : newPassword,
//                 pass2 : confirmPassword
//             })
//     });
//     const result = await response.json();
//     console.log(result.errors);
    
//     if (!response.ok) {

//         throw new Error('Failed to update password');
//     }
    
//         // alert('Password updated successfully!');
    
//     } catch (error) {
//         console.log('Error updating password:', error);
//         // alert('Failed to update password. Please check your current password and try again.');
//     }
// }

// async function uploadProfileImage(imageFile) {
//     try {
//         const token = getCookieValue('access_token');
        
//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
        
//         // Create FormData object to send the file
//         const formData = new FormData();
//         formData.append('uploaded_image', imageFile);
        
//         // Send the file to the backend
//         const response = await fetch('/api/user/update/', {
//             method: 'PUT', 
//             headers: {
//                 'Authorization': `Bearer ${token}`
//             },
//             body: formData
//         });
        
//         if (!response.ok) {
//             console.log('Profile image updated successfully!', response);
//             throw new Error('Failed to upload profile image');
//         }
//         const result = await response.json();
//         if (response.ok)
//             document.getElementById('profile-image').src = result.uploaded_image;
//         console.log(result.message);

//         console.log('Profile image updated successfully!');

//     } catch (error) {
//         console.error('Error uploading profile image:', error);
//         // alert('Failed to upload profile image. Please try again later.');
//     }
// }

// async function deleteUserProfile() {
//     try {
//         const token = getCookieValue('access_token');
        
//         if (!token) {
//             console.error('No authentication token found');
//             return;
//         }
        
//         const response = await fetch('/api/delete-profile/', {
//             method: 'DELETE',
//             credentials: "include",
//             headers: {
//                 'Authorization': `Bearer ${token}`,
//                 'Content-Type': 'application/json'
//             }
//         });
        
//         if (!response.ok) {
//             throw new Error('Failed to delete profile');
//         }
        
//         // Handle successful deletion
//         // alert('Profile deleted successfully. You will be redirected to the login page.');
//         // Clear cookies/tokens

//         // Redirect to login page
//         window.location.hash = 'login';
        
//     } catch (error) {
//         console.error('Error deleting profile:', error);
//         alert('Failed to delete profile. Please try again later.');
//     }
// }

// // Call the function when the document is loaded
// document.addEventListener('DOMContentLoaded', function() {
//     displayProfile();
// });

// export default displayProfile;