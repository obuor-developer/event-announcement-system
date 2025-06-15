// Replace with your actual API Gateway URL
const API_BASE_URL = 'https://your-api-id.execute-api.region.amazonaws.com/prod';

// Sample events data
let events = [];

// DOM elements
const subscriptionForm = document.getElementById('subscriptionForm');
const eventForm = document.getElementById('eventForm');
const subscriptionMessage = document.getElementById('subscriptionMessage');
const eventMessage = document.getElementById('eventMessage');
const eventsList = document.getElementById('eventsList');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadSampleEvents();
    displayEvents();
    
    // Form event listeners
    subscriptionForm.addEventListener('submit', handleSubscription);
    eventForm.addEventListener('submit', handleEventCreation);
});

// Handle email subscription
async function handleSubscription(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const submitBtn = subscriptionForm.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subscribing...';
    hideMessage(subscriptionMessage);
    
    try {
        const response = await fetch(`https://7jci5u3l14.execute-api.us-east-1.amazonaws.com/prod/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(subscriptionMessage, data.message, 'success');
            subscriptionForm.reset();
        } else {
            showMessage(subscriptionMessage, data.error || 'Subscription failed', 'error');
        }
    } catch (error) {
        console.error('Subscription error:', error);
        showMessage(subscriptionMessage, 'Network error. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Subscribe';
    }
}

// Handle event creation
async function handleEventCreation(e) {
    e.preventDefault();
    
    const eventName = document.getElementById('eventName').value;
    const eventDescription = document.getElementById('eventDescription').value;
    const eventDate = document.getElementById('eventDate').value;
    const submitBtn = eventForm.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Event...';
    hideMessage(eventMessage);
    
    try {
        const response = await fetch(`https://7jci5u3l14.execute-api.us-east-1.amazonaws.com/prod/create-event`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                eventName: eventName,
                eventDescription: eventDescription,
                eventDate: eventDate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage(eventMessage, data.message, 'success');
            eventForm.reset();
            
            // Add new event to the list
            events.unshift({
                name: eventName,
                description: eventDescription,
                date: eventDate,
                created_at: new Date().toISOString()
            });
            displayEvents();
        } else {
            showMessage(eventMessage, data.error || 'Event creation failed', 'error');
        }
    } catch (error) {
        console.error('Event creation error:', error);
        showMessage(eventMessage, 'Network error. Please try again.', 'error');
    } finally {
        // Reset button state
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Event & Notify';
    }
}

// Show message
function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    
    // Hide message after 5 seconds
    setTimeout(() => {
        hideMessage(element);
    }, 5000);
}

// Hide message
function hideMessage(element) {
    element.style.display = 'none';
}

// Load sample events
function loadSampleEvents() {
    events = [
        {
            name: "Welcome to Event System",
            description: "This is a demo event to show how the notification system works.",
            date: "2025-06-15T10:00:00",
            created_at: "2025-06-08T08:00:00Z"
        },
        {
            name: "AWS Workshop",
            description: "Learn serverless architecture with AWS Lambda, SNS, and API Gateway.",
            date: "2025-06-20T14:00:00",
            created_at: "2025-06-07T12:00:00Z"
        }
    ];
}

// Display events
function displayEvents() {
    if (events.length === 0) {
        eventsList.innerHTML = '<p class="loading">No events yet. Create your first event above!</p>';
        return;
    }
    
    const eventsHTML = events.map(event => {
        const eventDate = new Date(event.date);
        const formattedDate = eventDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <div class="event-item">
                <h3>${event.name}</h3>
                <p>${event.description}</p>
                <p class="event-date">📅 ${formattedDate}</p>
            </div>
        `;
    }).join('');
    
    eventsList.innerHTML = eventsHTML;
}