import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getDatabase, ref, set, get, update, remove } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBbsD2fPMTbLmy7uG1xsMDqsn5WshzDo2U",
    authDomain: "crud-project-73400.firebaseapp.com",
    projectId: "crud-project-73400",
    storageBucket: "crud-project-73400.firebasestorage.app",
    messagingSenderId: "4838238630",
    appId: "1:4838238630:web:8ffd314401895240438767"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);

// DOM Elements
const signupPage = document.getElementById('signup-page');
const loginPage = document.getElementById('login-page');
const homePage = document.getElementById('home-page');
const profilePage = document.getElementById('profile-page');
const notification = document.getElementById('notification');

// Show Notification
function showNotification(message, type = 'success') {
    notification.textContent = message;
    notification.style.display = 'block';
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    setTimeout(() => notification.style.display = 'none', 3000);
}

// Sign Up
document.getElementById('signup-btn').addEventListener('click', () => {
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    createUserWithEmailAndPassword(auth, email, password)
        .then(() => {
            showNotification('Signup successful! Please login.');
            loginPage.classList.remove('hidden');
            signupPage.classList.add('hidden');
        })
        .catch((error) => showNotification(error.message, 'error'));
});

// Login
document.getElementById('login-btn').addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => {
            showNotification('Login successful!');
            homePage.classList.remove('hidden');
            loginPage.classList.add('hidden');
            loadPosts();
        })
        .catch((error) => showNotification(error.message, 'error'));
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    signOut(auth).then(() => {
        showNotification('Logged out successfully.');
        homePage.classList.add('hidden');
        loginPage.classList.remove('hidden');
    });
});

// Create Post
document.getElementById('create-post-btn').addEventListener('click', () => {
    const title = document.getElementById('post-title').value;
    const description = document.getElementById('post-description').value;

    if (title && description) {
        const postId = Date.now().toString();
        set(ref(db, `posts/${postId}`), {
            title,
            description,
            userId: auth.currentUser.uid
        }).then(() => {
            showNotification('Post created successfully!');
            loadPosts();
        });
    } else {
        showNotification('Please fill all fields.', 'error');
    }
});

// Load Posts
function loadPosts() {
    const postsContainer = document.getElementById('posts-container');
    postsContainer.innerHTML = '';

    get(ref(db, 'posts')).then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const post = childSnapshot.val();
            const postCard = `
                <div class="post-card">
                    <h3>${post.title}</h3>
                    <p>${post.description}</p>
                    <button onclick="updatePost('${childSnapshot.key}')">Update</button>
                    <button onclick="deletePost('${childSnapshot.key}')">Delete</button>
                </div>
            `;
            postsContainer.innerHTML += postCard;
        });
    });
}

// Update Post
window.updatePost = function(postId) {
    const title = prompt('Enter new title:');
    const description = prompt('Enter new description:');

    if (title && description) {
        update(ref(db, `posts/${postId}`), { title, description }).then(() => {
            showNotification('Post updated successfully!');
            loadPosts();
        });
    }
};

// Delete Post
window.deletePost = function(postId) {
    remove(ref(db, `posts/${postId}`)).then(() => {
        showNotification('Post deleted successfully!');
        loadPosts();
    });
};

// Update Profile
document.getElementById('update-profile-btn').addEventListener('click', () => {
    homePage.classList.add('hidden');
    profilePage.classList.remove('hidden');
});

document.getElementById('save-profile-btn').addEventListener('click', () => {
    const file = document.getElementById('profile-picture').files[0];
    if (file) {
        const storageReference = storageRef(storage, `profile-pictures/${auth.currentUser.uid}`);
        uploadBytes(storageReference, file).then(() => {
            getDownloadURL(storageReference).then((url) => {
                update(ref(db, `users/${auth.currentUser.uid}`), { profilePicture: url }).then(() => {
                    showNotification('Profile picture updated successfully!');
                });
            });
        });
    }
});

// Back to Home
document.getElementById('back-to-home-btn').addEventListener('click', () => {
    profilePage.classList.add('hidden');
    homePage.classList.remove('hidden');
});

// Navigation Links
document.getElementById('login-link').addEventListener('click', () => {
    signupPage.classList.add('hidden');
    loginPage.classList.remove('hidden');
});

document.getElementById('signup-link').addEventListener('click', () => {
    loginPage.classList.add('hidden');
    signupPage.classList.remove('hidden');
});