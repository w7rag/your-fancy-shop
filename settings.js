document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar');
    const settingsContent = document.querySelector('.settings-content');
    const languageSelect = document.getElementById('language-select');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const starRating = document.querySelector('.star-rating');
    const feedbackText = document.getElementById('feedback-text');
    const submitFeedback = document.getElementById('submit-feedback');
    const feedbackList = document.querySelector('.feedback-list');

    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

    // Sidebar navigation
    sidebar.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            e.preventDefault();
            document.querySelectorAll('.sidebar a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
            settingsContent.querySelectorAll('section').forEach(section => section.classList.remove('active'));
            document.querySelector(e.target.getAttribute('href')).classList.add('active');
        }
    });

    // Language selection
    languageSelect.addEventListener('change', (e) => {
        const selectedLanguage = e.target.value;
        localStorage.setItem('language', selectedLanguage);
    });

    // Theme selection
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const selectedTheme = btn.getAttribute('data-theme');
            document.body.className = `theme-${selectedTheme}`;
            localStorage.setItem('theme', selectedTheme);
            
            const event = new CustomEvent('themeChanged', { detail: selectedTheme });
            window.dispatchEvent(event);
        });
    });

    // Star rating
    let currentRating = 0;
    starRating.addEventListener('click', (e) => {
        if (e.target.tagName === 'I') {
            currentRating = parseInt(e.target.getAttribute('data-rating'));
            updateStarRating();
        }
    });

    function updateStarRating() {
        starRating.querySelectorAll('i').forEach((star, index) => {
            star.classList.toggle('active', index < currentRating);
        });
    }

    // Submit feedback
    submitFeedback.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentRating === 0 || feedbackText.value.trim() === '') {
            alert('Please provide both a rating and feedback text.');
            return;
        }
        const feedback = {
            rating: currentRating,
            comment: feedbackText.value.trim(),
            votes: { up: 0, down: 0 },
            userVote: null,
            id: Date.now(),
            userId: currentUser ? currentUser.id : null
        };
        saveFeedback(feedback);
        addFeedbackToList(feedback);
        resetFeedbackForm();
    });

    function saveFeedback(feedback) {
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbacks.push(feedback);
        localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    }

    function addFeedbackToList(feedback) {
        const feedbackItem = document.createElement('div');
        feedbackItem.classList.add('feedback-item');
        feedbackItem.innerHTML = `
            <div class="rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
            <div class="comment">${feedback.comment}</div>
            <div class="votes">
                <button class="vote-btn up-vote ${feedback.userVote === 'up' ? 'active' : ''}" data-id="${feedback.id}"><i class="fas fa-thumbs-up"></i> <span>${feedback.votes.up}</span></button>
                <button class="vote-btn down-vote ${feedback.userVote === 'down' ? 'active' : ''}" data-id="${feedback.id}"><i class="fas fa-thumbs-down"></i> <span>${feedback.votes.down}</span></button>
            </div>
            ${currentUser && currentUser.isAdmin ? `<button class="delete-feedback" data-id="${feedback.id}"><i class="fas fa-trash"></i></button>` : ''}
        `;
        feedbackList.prepend(feedbackItem);
    }

    function resetFeedbackForm() {
        currentRating = 0;
        updateStarRating();
        feedbackText.value = '';
    }

    // Load saved feedbacks
    function loadFeedbacks() {
        const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        feedbackList.innerHTML = ''; // Clear existing feedbacks before loading
        feedbacks.forEach(addFeedbackToList);
    }

    // Voting system
    feedbackList.addEventListener('click', (e) => {
        if (e.target.closest('.vote-btn')) {
            const btn = e.target.closest('.vote-btn');
            const feedbackId = parseInt(btn.getAttribute('data-id'));
            const voteType = btn.classList.contains('up-vote') ? 'up' : 'down';
            updateVote(feedbackId, voteType);
        } else if (e.target.closest('.delete-feedback')) {
            const btn = e.target.closest('.delete-feedback');
            const feedbackId = parseInt(btn.getAttribute('data-id'));
            deleteFeedback(feedbackId);
        }
    });

    function updateVote(feedbackId, voteType) {
        let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
        const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);
        if (feedbackIndex !== -1) {
            const feedback = feedbacks[feedbackIndex];
            const oppositeType = voteType === 'up' ? 'down' : 'up';
            
            if (feedback.userVote === voteType) {
                feedback.votes[voteType]--;
                feedback.userVote = null;
            } else {
                if (feedback.userVote) {
                    feedback.votes[oppositeType]--;
                }
                feedback.votes[voteType]++;
                feedback.userVote = voteType;
            }

            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            updateVoteDisplay(feedbackId, feedback.votes, feedback.userVote);
        }
    }

    function updateVoteDisplay(feedbackId, votes, userVote) {
        const upVoteBtn = document.querySelector(`.vote-btn.up-vote[data-id="${feedbackId}"]`);
        const downVoteBtn = document.querySelector(`.vote-btn.down-vote[data-id="${feedbackId}"]`);
        
        if (upVoteBtn && downVoteBtn) {
            upVoteBtn.querySelector('span').textContent = votes.up;
            downVoteBtn.querySelector('span').textContent = votes.down;
            
            upVoteBtn.classList.toggle('active', userVote === 'up');
            downVoteBtn.classList.toggle('active', userVote === 'down');
        }
    }

    function deleteFeedback(feedbackId) {
        if (confirm('Are you sure you want to delete this feedback?')) {
            let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
            feedbacks = feedbacks.filter(f => f.id !== feedbackId);
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
            loadFeedbacks(); // Reload all feedbacks after deletion
        }
    }

    // User authentication
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const logoutButton = document.getElementById('logout-button');
    const accountSection = document.getElementById('account-section');
    const loginRegisterSection = document.getElementById('login-register-section');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        login(username, password);
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        register(username, password);
    });

    logoutButton.addEventListener('click', logout);

    function login(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            updateAuthUI();
            if (user.isAdmin) {
                document.getElementById('admin-link').style.display = 'block';
            }
            console.log('Login successful:', user); // Add this line for debugging
        } else {
            alert('Invalid username or password');
            console.log('Login failed. Users:', users); // Add this line for debugging
        }
    }
    

    function register(username, password) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (users.some(u => u.username === username)) {
            alert('Username already exists');
            return;
        }
        const newUser = { id: Date.now(), username, password, isAdmin: false };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        login(username, password);
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateAuthUI();
        document.getElementById('admin-link').style.display = 'none';
    }

    function updateAuthUI() {
        if (currentUser) {
            loginRegisterSection.style.display = 'none';
            accountSection.style.display = 'block';
            document.getElementById('account-username').textContent = currentUser.username;
        } else {
            loginRegisterSection.style.display = 'block';
            accountSection.style.display = 'none';
        }
    }

    // Account management
    const changeUsernameForm = document.getElementById('change-username-form');
    const changePasswordForm = document.getElementById('change-password-form');
    const deleteAccountButton = document.getElementById('delete-account-button');

    changeUsernameForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newUsername = document.getElementById('new-username').value;
        changeUsername(newUsername);
    });

    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        changePassword(oldPassword, newPassword, confirmPassword);
    });

    deleteAccountButton.addEventListener('click', deleteAccount);

    function changeUsername(newUsername) {
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].username = newUsername;
            localStorage.setItem('users', JSON.stringify(users));
            currentUser.username = newUsername;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            document.getElementById('account-username').textContent = newUsername;
            alert('Username changed successfully');
        }
    }

    function changePassword(oldPassword, newPassword, confirmPassword) {
        if (oldPassword !== currentUser.password) {
            alert('Incorrect old password');
            return;
        }
        if (newPassword !== confirmPassword) {
            alert('New passwords do not match');
            return;
        }
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            currentUser.password = newPassword;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Password changed successfully');
        }
    }

    function deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const updatedUsers = users.filter(u => u.id !== currentUser.id);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            logout();
        }
    }

    function clearAllData() {
        localStorage.clear();
        console.log('All data cleared');
        location.reload();
    }
    
    // You can call this function from the browser console if needed
    window.clearAllData = clearAllData;
    

    // Initialize
    loadFeedbacks();
    updateAuthUI();
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) languageSelect.value = savedLanguage;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = `theme-${savedTheme}`;
        const activeThemeButton = document.querySelector(`.theme-btn[data-theme="${savedTheme}"]`);
        if (activeThemeButton) activeThemeButton.classList.add('active');
    }

    // Check for admin and owner accounts
const users = JSON.parse(localStorage.getItem('users')) || [];
let updated = false;

if (!users.some(u => u.username === 'manager')) {
    const adminUser = { id: Date.now(), username: 'manager', password: 'qxv191269', isAdmin: true };
    users.push(adminUser);
    updated = true;
}

if (!users.some(u => u.username === 'm113')) {
    const adminUser = { id: Date.now(), username: '25', password: '19126999MK4', isAdmin: true, isOwner: true };
    users.push(adminUser);
    updated = true;
}

if (updated) {
    localStorage.setItem('users', JSON.stringify(users));
    console.log('Updated users:', users); // Add this line for debugging
}
});