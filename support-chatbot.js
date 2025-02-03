// Support Chatbot System

const chatbotKnowledge = {
    greetings: [
        'Hello! How can I help you today?',
        'Hi there! I\'m here to assist you with LIC policies.',
        'Welcome! What would you like to know about our insurance plans?'
    ],
    faqs: {
        'policy types': {
            question: ['what types of policies', 'policy options', 'available plans'],
            answer: 'We offer various types of policies including Term Insurance, Endowment Plans, Money Back Policies, ULIPs, and Pension Plans. Would you like to know more about any specific policy?'
        },
        'premium payment': {
            question: ['how to pay premium', 'payment methods', 'premium payment options'],
            answer: 'You can pay your premium through multiple channels: Online through our website/app, Net banking, Credit/Debit cards, or at any LIC branch. Would you like me to guide you through the payment process?'
        },
        'claim process': {
            question: ['how to claim', 'claim procedure', 'claim settlement'],
            answer: 'For claim settlement, you\'ll need to submit the policy document, death certificate (in case of death claim), and KYC documents. Would you like to know the detailed step-by-step process?'
        },
        'policy revival': {
            question: ['revive lapsed policy', 'policy revival', 'reinstate policy'],
            answer: 'A lapsed policy can be revived within 5 years from the date of first unpaid premium. You\'ll need to pay all due premiums with interest. Shall I explain the revival process?'
        }
    },
    responses: {
        default: 'I\'m not sure about that. Would you like to speak with a human agent?',
        needMoreInfo: 'Could you please provide more details about your query?',
        transfer: 'I\'ll transfer you to a human agent who can better assist you. Please wait a moment.'
    }
};

class SupportChatbot {
    constructor() {
        this.conversationHistory = [];
        this.currentIntent = null;
        this.waitingForFeedback = false;
    }

    initialize() {
        const chatContainer = document.createElement('div');
        chatContainer.id = 'chatbotContainer';
        chatContainer.innerHTML = `
            <div class="chatbot-widget">
                <div class="chat-header">
                    <img src="../images/lic-logo.png" alt="LIC Assistant" class="chat-avatar">
                    <div>
                        <h6 class="mb-0">LIC Assistant</h6>
                        <small class="text-success">Online</small>
                    </div>
                    <button class="btn-close ms-auto" onclick="toggleChatbot()"></button>
                </div>
                <div class="chat-messages" id="chatMessages"></div>
                <div class="chat-input">
                    <form id="chatForm" onsubmit="return false;">
                        <div class="input-group">
                            <input type="text" class="form-control" id="userInput" 
                                placeholder="Type your message..." autocomplete="off">
                            <button class="btn btn-primary" type="submit">
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <button class="chatbot-trigger" onclick="toggleChatbot()">
                <i class="fas fa-comments"></i>
            </button>
        `;

        document.body.appendChild(chatContainer);
        this.setupEventListeners();
        this.sendBotMessage(this.getRandomGreeting());
    }

    setupEventListeners() {
        const form = document.getElementById('chatForm');
        const input = document.getElementById('userInput');

        form.addEventListener('submit', () => {
            const message = input.value.trim();
            if (message) {
                this.handleUserMessage(message);
                input.value = '';
            }
        });

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });
    }

    handleUserMessage(message) {
        this.addMessageToChat('user', message);
        this.conversationHistory.push({ role: 'user', message });

        if (this.waitingForFeedback) {
            this.handleFeedback(message);
            return;
        }

        const response = this.generateResponse(message);
        setTimeout(() => {
            this.sendBotMessage(response);
        }, 500);
    }

    generateResponse(message) {
        const normalizedMessage = message.toLowerCase();

        // Check for greetings
        if (this.isGreeting(normalizedMessage)) {
            return this.getRandomGreeting();
        }

        // Check FAQ matches
        for (const [topic, data] of Object.entries(chatbotKnowledge.faqs)) {
            if (data.question.some(q => normalizedMessage.includes(q))) {
                this.currentIntent = topic;
                return data.answer;
            }
        }

        // Check for specific keywords
        if (normalizedMessage.includes('agent') || normalizedMessage.includes('human')) {
            this.currentIntent = 'transfer';
            return this.handleTransferRequest();
        }

        if (normalizedMessage.includes('help') || normalizedMessage.includes('support')) {
            return 'I can help you with information about our policies, premium payments, claims, and policy revival. What would you like to know?';
        }

        // If no match found
        this.currentIntent = 'unknown';
        return chatbotKnowledge.responses.needMoreInfo;
    }

    handleTransferRequest() {
        setTimeout(() => {
            this.sendBotMessage('Connecting you to an agent...');
            setTimeout(() => {
                this.sendBotMessage('An agent will be with you shortly. In the meantime, you can check our FAQ section for quick answers.');
                this.askForFeedback();
            }, 1000);
        }, 500);
        return chatbotKnowledge.responses.transfer;
    }

    handleFeedback(message) {
        this.waitingForFeedback = false;
        const isPositive = message.toLowerCase().includes('yes') || message.toLowerCase().includes('helpful');
        
        const response = isPositive
            ? 'I\'m glad I could help! Is there anything else you\'d like to know?'
            : 'I\'m sorry I couldn\'t help. I\'ll make sure to improve my responses. Would you like to speak with a human agent?';
        
        this.sendBotMessage(response);
    }

    askForFeedback() {
        this.waitingForFeedback = true;
        this.sendBotMessage('Was this information helpful? (Yes/No)');
    }

    sendBotMessage(message) {
        this.addMessageToChat('bot', message);
        this.conversationHistory.push({ role: 'bot', message });
    }

    addMessageToChat(role, message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}-message`;
        
        if (role === 'bot') {
            messageDiv.innerHTML = `
                <img src="../images/lic-logo.png" alt="LIC Assistant" class="message-avatar">
                <div class="message-content">${message}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${message}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    isGreeting(message) {
        const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
        return greetings.some(greeting => message.includes(greeting));
    }

    getRandomGreeting() {
        return chatbotKnowledge.greetings[Math.floor(Math.random() * chatbotKnowledge.greetings.length)];
    }
}

// Initialize chatbot
let chatbot;
let isChatbotVisible = false;

function initializeChatbot() {
    if (!chatbot) {
        chatbot = new SupportChatbot();
        chatbot.initialize();
    }
}

function toggleChatbot() {
    const container = document.getElementById('chatbotContainer');
    if (container) {
        isChatbotVisible = !isChatbotVisible;
        container.classList.toggle('active', isChatbotVisible);
    }
}

// Add chatbot styles
const style = document.createElement('style');
style.textContent = `
    #chatbotContainer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
        transition: all 0.3s ease;
    }

    .chatbot-widget {
        display: none;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        overflow: hidden;
        flex-direction: column;
    }

    #chatbotContainer.active .chatbot-widget {
        display: flex;
    }

    .chat-header {
        padding: 15px;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .chat-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
    }

    .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 15px;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .chat-message {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        max-width: 80%;
    }

    .bot-message {
        align-self: flex-start;
    }

    .user-message {
        align-self: flex-end;
        flex-direction: row-reverse;
    }

    .message-avatar {
        width: 24px;
        height: 24px;
        border-radius: 50%;
    }

    .message-content {
        padding: 8px 12px;
        border-radius: 15px;
        background: #f8f9fa;
        font-size: 14px;
    }

    .user-message .message-content {
        background: #2a5298;
        color: white;
    }

    .chat-input {
        padding: 15px;
        border-top: 1px solid #dee2e6;
    }

    .chatbot-trigger {
        display: none;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: #2a5298;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }

    #chatbotContainer:not(.active) .chatbot-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .chatbot-trigger:hover {
        transform: scale(1.1);
    }
`;

document.head.appendChild(style);

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChatbot);
