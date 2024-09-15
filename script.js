document.addEventListener('DOMContentLoaded', () => {
    const dynamicIsland = document.querySelector('.dynamic-island');
    const dots = document.querySelector('.dots');
    const islandContent = document.querySelector('.island-content');
    const supportButton = document.getElementById('supportButton');
    const chatContainer = document.getElementById('chatContainer');
    const closeChat = document.getElementById('closeChat');
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');

    let isExpanded = false;
    let loadingTimeout;
    let lastScrollTop = 0;
    let ticking = false;
    let currentState = 'initial';
    let problemType = '';
    let problemDescription = '';
    let problemTimestamp = '';

    const chatbotStates = {
        initial: {
            message: "Hello! I'm here to help. What kind of problem are you experiencing? (e.g., technical, billing, product)",
            next: (response) => {
                problemType = response.toLowerCase();
                return 'description';
            }
        },
        description: {
            message: "I see. Can you please describe the problem in more detail?",
            next: (response) => {
                problemDescription = response;
                return 'timestamp';
            }
        },
        timestamp: {
            message: "Thank you. When did you first notice this problem?",
            next: (response) => {
                problemTimestamp = response;
                return 'summary';
            }
        },
        summary: {
            message: () => `Thank you for providing that information. To summarize:
            Problem Type: ${problemType}
            Description: ${problemDescription}
            Timestamp: ${problemTimestamp}
            
            Is this correct? (Yes/No)`,
            next: (response) => {
                return response.toLowerCase() === 'yes' ? 'final' : 'initial';
            }
        },
        final: {
            message: "Thank you for confirming. I've logged your issue and our support team will get back to you within 24 hours. Is there anything else I can help you with?",
            next: (response) => {
                if (response.toLowerCase().includes('yes')) {
                    saveSupportRequest();
                    return 'initial';
                } else {
                    saveSupportRequest();
                    return 'goodbye';
                }
            }
        },
        goodbye: {
            message: "Thank you for using our support chat. Have a great day!",
            next: () => 'end'
        }
    };

    function expandIsland() {
        if (isExpanded) return;
        isExpanded = true;
        dynamicIsland.classList.add('expanded');
        dots.classList.remove('idle');
        dots.classList.add('loading');
        clearTimeout(loadingTimeout);
        loadingTimeout = setTimeout(() => {
            dots.style.display = 'none';
            islandContent.style.opacity = '1';
        }, 1000);
    }

    function collapseIsland() {
        if (!isExpanded) return;
        isExpanded = false;
        dynamicIsland.classList.remove('expanded');
        clearTimeout(loadingTimeout);
        islandContent.style.opacity = '0';
        setTimeout(() => {
            dots.classList.remove('loading');
            dots.classList.add('idle');
            dots.style.display = 'flex';
        }, 300);
    }

    function setJumpAnimation() {
        if (dots.classList.contains('idle')) {
            dots.querySelectorAll('span').forEach((dot, index) => {
                dot.style.animation = `jump 1.5s ease-in-out ${index * 0.2}s infinite`;
            });
        } else {
            dots.querySelectorAll('span').forEach((dot) => {
                dot.style.animation = 'none';
            });
        }
    }

    function updateDynamicIsland(scrollPos) {
        if (scrollPos > lastScrollTop && scrollPos > 50) {
            dynamicIsland.classList.add('hidden');
        } else {
            dynamicIsland.classList.remove('hidden');
        }
        lastScrollTop = scrollPos;
    }

    function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage(message, 'user');
            userInput.value = '';
            processUserInput(message);
        }
    }

    function addMessage(message, sender) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function processUserInput(input) {
        const currentStateObj = chatbotStates[currentState];
        const nextState = currentStateObj.next(input);
        currentState = nextState;

        if (nextState !== 'end') {
            const nextStateObj = chatbotStates[nextState];
            const response = typeof nextStateObj.message === 'function' ? nextStateObj.message() : nextStateObj.message;
            setTimeout(() => addMessage(response, 'ai'), 500);
        }
    }

    function resetChat() {
        currentState = 'initial';
        problemType = '';
        problemDescription = '';
        problemTimestamp = '';
        chatMessages.innerHTML = '';
    }

    function saveSupportRequest() {
        const supportData = {
            problemType,
            problemDescription,
            problemTimestamp,
            timestamp: new Date().toISOString()
        };

        let supportRequests = JSON.parse(localStorage.getItem('supportRequests') || '[]');
        supportRequests.push(supportData);
        localStorage.setItem('supportRequests', JSON.stringify(supportRequests));
    }

    dynamicIsland.addEventListener('mouseenter', expandIsland);
    dynamicIsland.addEventListener('mouseleave', collapseIsland);

    dots.classList.add('idle');
    setJumpAnimation();

    setInterval(setJumpAnimation, 100);

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateDynamicIsland(window.pageYOffset);
                ticking = false;
            });
            ticking = true;
        }
    });

    supportButton.addEventListener('click', () => {
        chatContainer.style.display = 'flex';
        if (currentState === 'initial') {
            addMessage(chatbotStates[currentState].message, 'ai');
        }
    });

    closeChat.addEventListener('click', () => {
        chatContainer.style.display = 'none';
        resetChat();
    });

    sendButton.addEventListener('click', sendMessage);
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Accordion functionality
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });
    });

    // products (home.html)

    dynamicIsland.addEventListener('mouseenter', () => {
        dynamicIsland.classList.add('expanded');
        dots.style.display = 'none';
        islandContent.style.display = 'flex';
    });

    dynamicIsland.addEventListener('mouseleave', () => {
        dynamicIsland.classList.remove('expanded');
        dots.style.display = 'flex';
        islandContent.style.display = 'none';
    });
});
