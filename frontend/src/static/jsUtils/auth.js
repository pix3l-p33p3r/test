// export function isAuthenticated() {
//     const token = getCookieValue('access_token');
//     return !!token;
// }

export function isAuthenticated() {
    const token = getCookieValue('access_token');
    console.log("Checking authentication, token:", token ? 'exists' : 'missing');
    return token !== null;
}

export function getToken() {
    return localStorage.getItem('accessToken');
}

export function setToken(token) {
    localStorage.setItem('accessToken', token);
}

export function clearToken() {
    localStorage.removeItem('accessToken');
}

export function logoutUser() {
    clearToken();

    window.location.hash = 'login';
}

export function getCookieValue(name) {
    const cookies = document.cookie.split(";");
    
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        
        if (cookieName.trim() === name) {
            return cookieValue;
        }
    }
    return null; // Return null if the cookie is not found
}

export function setProfileImage(userData) {
    let imageTemp;
    
    if (userData.user.uploaded_image) {
        console.log('' + userData.user.uploaded_image);
        imageTemp = '' + userData.user.uploaded_image;
    } else if (userData.user.image_url) {
        console.log(userData.user.image_url);
        imageTemp = userData.user.image_url;
    } else {
        imageTemp = '/static/resources/default.jpg';
    }
    
    document.getElementById('profile-image').src = imageTemp;
}

export function setProfileImage2(userData) {
    let imageTemp;

    if (userData.user.uploaded_image) {
        imageTemp = '' + userData.user.uploaded_image;
    } else if (userData.user.image_url) {
        imageTemp = userData.user.image_url;
    } else {
        imageTemp = '/static/resources/default.jpg';
    }
    return imageTemp;
}