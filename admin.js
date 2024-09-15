document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (window.location.pathname.includes('adminonly.html')) {
        if (currentUser && currentUser.isAdmin) {
            window.location.href = 'JN9DIUNQ19DB189D1-URED1D-D13-BF21N-.html';
        }
    } else if (window.location.pathname.includes('JN9DIUNQ19DB189D1-URED1D-D13-BF21N-')) {
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = 'adminonly.html';
        } else {
            initAdminPanel();
        }
    }

    function initAdminPanel() {
        const sidebar = document.querySelector('.admin-sidebar');
        const adminContent = document.querySelector('.admin-content');
        const chatMessages = document.getElementById('admin-chat-messages');
        const chatText = document.getElementById('admin-chat-text');
        const chatSend = document.getElementById('admin-chat-send');
        const displayUsername = document.getElementById('display-username');
        const saveDisplayUsername = document.getElementById('save-display-username');
        const newsContent = document.getElementById('news-content');
        const newsText = document.getElementById('news-text');
        const newsSend = document.getElementById('news-send');
        const newsNotification = document.getElementById('news-notification');

        sidebar.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                document.querySelectorAll('.admin-sidebar a').forEach(a => a.classList.remove('active'));
                e.target.classList.add('active');
                adminContent.querySelectorAll('section').forEach(section => section.classList.remove('active'));
                document.querySelector(e.target.getAttribute('href')).classList.add('active');
                if (e.target.getAttribute('href') === '#news') {
                    newsNotification.style.display = 'none';
                    newsNotification.textContent = '';
                }
            }
        });

        chatSend.addEventListener('click', sendAdminMessage);
        chatText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendAdminMessage();
            }
        });

        saveDisplayUsername.addEventListener('click', () => {
            currentUser.displayUsername = displayUsername.value;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            alert('Display username saved successfully');
        });

        newsSend.addEventListener('click', sendNews);
        newsText.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendNews();
            }
        });

        function sendAdminMessage() {
            const message = chatText.value.trim();
            if (message) {
                if (message.startsWith('/')) {
                    handleCommand(message, 'chat');
                } else {
                    const adminMessage = {
                        user: currentUser.displayUsername || currentUser.username,
                        message: message,
                        timestamp: new Date().toISOString()
                    };
                    saveAdminMessage(adminMessage);
                    addAdminMessageToChat(adminMessage);
                }
                chatText.value = '';
            }
        }

        function handleCommand(command, context) {
            const parts = command.split(' ');
            const commandName = parts[0].toLowerCase();
            
            switch (commandName) {
                case '/clear':
                    const count = parseInt(parts[1]) || 100;
                    clearMessages(count, context);
                    break;
                case '/notify':
                    if (currentUser.username === '25') {
                        addNotification();
                    } else {
                        addSystemMessage('You do not have permission to use this command.', context);
                    }
                    break;
                default:
                    addSystemMessage('Unknown command.', context);
            }
        }

        function clearMessages(count, context) {
            if (context === 'chat') {
                let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
                adminMessages = adminMessages.slice(0, Math.max(0, adminMessages.length - count));
                localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
                loadAdminMessages();
            } else if (context === 'news') {
                let news = JSON.parse(localStorage.getItem('adminNews')) || [];
                news = news.slice(0, Math.max(0, news.length - count));
                localStorage.setItem('adminNews', JSON.stringify(news));
                loadNews();
            }
            addSystemMessage(`Cleared ${count} messages.`, context);
        }

        function addNotification() {
            const currentNotifications = parseInt(newsNotification.textContent) || 0;
            newsNotification.textContent = currentNotifications + 1;
            newsNotification.style.display = 'inline';
        }

        function addSystemMessage(message, context) {
            const systemMessage = {
                user: 'System',
                message: message,
                timestamp: new Date().toISOString()
            };
            if (context === 'chat') {
                addAdminMessageToChat(systemMessage);
            } else if (context === 'news') {
                addNewsToContent(systemMessage);
            }
        }

        function saveAdminMessage(message) {
            let adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
            adminMessages.push(message);
            localStorage.setItem('adminMessages', JSON.stringify(adminMessages));
        }

        function addAdminMessageToChat(message) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('admin-message');
            messageElement.innerHTML = `
                <strong>${message.user}:</strong> ${message.message}
                <small>${new Date(message.timestamp).toLocaleString()}</small>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }

        function sendNews() {
            const message = newsText.value.trim();
            if (message) {
                if (message.startsWith('/')) {
                    handleCommand(message, 'news');
                } else if (currentUser.username === '25') {
                    const newsItem = {
                        author: currentUser.displayUsername || currentUser.username,
                        content: message,
                        timestamp: new Date().toISOString()
                    };
                    saveNews(newsItem);
                    addNewsToContent(newsItem);
                } else {
                    alert('You do not have permission to post news.');
                }
                newsText.value = '';
            }
        }

        function saveNews(newsItem) {
            let news = JSON.parse(localStorage.getItem('adminNews')) || [];
            news.push(newsItem);
            localStorage.setItem('adminNews', JSON.stringify(news));
        }

        function addNewsToContent(newsItem) {
            const newsElement = document.createElement('div');
            newsElement.classList.add('news-item');
            newsElement.innerHTML = `
                <div class="news-author">${newsItem.author || 'System'}</div>
                <div class="news-content">${newsItem.content}</div>
                <div class="news-timestamp">${new Date(newsItem.timestamp).toLocaleString()}</div>
            `;
            newsContent.appendChild(newsElement);
            newsContent.scrollTop = newsContent.scrollHeight;
        }

        function loadAdminMessages() {
            chatMessages.innerHTML = '';
            const adminMessages = JSON.parse(localStorage.getItem('adminMessages')) || [];
            adminMessages.forEach(addAdminMessageToChat);
        }

        function loadNews() {
            newsContent.innerHTML = '';
            const news = JSON.parse(localStorage.getItem('adminNews')) || [];
            news.forEach(addNewsToContent);
        }

        // Initialize
        loadAdminMessages();
        loadNews();
        displayUsername.value = currentUser.displayUsername || currentUser.username;

        // Check for owner account
        const users = JSON.parse(localStorage.getItem('users')) || [];
        if (!users.some(u => u.username === '25')) {
            const ownerUser = { id: Date.now(), username: '25', password: '19126999MK4', isAdmin: true, isOwner: true };
            users.push(ownerUser);
            localStorage.setItem('users', JSON.stringify(users));
        }

        // Hide news input for non-owners
        if (currentUser.username !== '25') {
            document.getElementById('news-input').style.display = 'none';
        }
    }
});
