# event-announcement-system
Frontend (S3) → API Gateway → Lambda Functions → SNS → Email Notifications

![ChatGPT Image Jun 15, 2025, 06_06_21 AM](https://github.com/user-attachments/assets/0e8bc448-de92-4ba5-a591-82d1879ed6b4)

Event Announcement System (SNS + Lambda + API Gateway)
Add up to 4 tagsMaximum 4 selections
Selected items:

# cloudcomputing

# cloudpractitioner

# solutionarchitect

Add another...
Bold CTRL + B
Italic CTRL + I
Link CTRL + K
Ordered list
Unordered list
Heading
Quote
Code
Code block
Embed CTRL + SHIFT + K
No file chosenUpload image


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/trb52zre47sxnlhbv64i.png)

AWS Event Notification System - Step-by-Step Guide
🏗️ Architecture Overview
Frontend (S3) → API Gateway → Lambda Functions → SNS → Email Notifications
Components:

S3 Static Website: Frontend hosting
API Gateway: REST API endpoints
Lambda Functions: Backend logic (2 functions)
SNS: Email notification service
IAM Roles: Permissions management


📋 Prerequisites

AWS Account with appropriate permissions
Basic knowledge of HTML/CSS/JavaScript
AWS CLI installed (optional but recommended)

**
## Step 1: Create SNS Topic
1.1 Create SNS Topic
** Via AWS CLI
aws sns create-topic --name EventNotifications

# Or use AWS Console:
# Services → SNS → Topics → Create topic
# Name: EventNotifications
# Type: Standard

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/sdmqq3o4qoyp2wmgk6ec.png)

2. Click on 'Next'

Select' Standard' and click 'Create Topic'

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/76pz7uy41qd73foblrml.png)

1.2 Note the Topic ARN
Save the ARN - you'll need it later:
arn:aws:sns:us-east-1:944355517192:EventNotifications

Step 2: Create IAM Roles
2.1 Lambda Execution Role
Create a role with these policies:

AWSLambdaBasicExecutionRole
Custom policy for SNS access:

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/d79i7bubz3jku5ym9cre.png)

Click on 'Create policy'

Custom SNS Policy:
Copy your SNS ARN and paste it inside your IAM role policy JSON.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sns:Subscribe",
                "sns:Publish",
                "sns:ListSubscriptionsByTopic"
            ],
            "Resource": "arn:aws:sns:*:*:EventNotifications"
        }
    ]
}
```


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ymoum6umnbkdsey6j3uf.png)


Step 3: Create Lambda Functions
Type 'Lambda' at the AWS management console search, and click on 'Create a function'

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/20og3fqnxejh153c7l6r.png)  


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/mtpbl5qn5oh37rcyy0iw.png)



3.1 Subscription Lambda Function

Select 'Author from scratch' and name your Lambda function

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/u425xcqllet2qdot6czj.png)

Function Name: event-subscription-handler
Runtime: Python 3.9
Architecture: arm64

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xoe1w6ncs1t7o7ifdtvu.png)

Click 'additional configurations' and check the following: AWS_IAM, Buffered, and VPC. 
Now select your respective VPC, Subnet, and Security groups 
Click on 'Create function'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/0550ygj6ikzkvkujb9b7.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vdwwetj9uugrdimin6k6.png)

Select 'Code', copy the Python code and paste it inside lambda_function.py

```
import json
import boto3
import os
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize SNS client
    sns = boto3.client('sns')
    
    # Get SNS topic ARN from environment variable
    topic_arn = os.environ['SNS_TOPIC_ARN']
    
    try:
        # Parse request body
        if event.get('body'):
            body = json.loads(event['body'])
        else:
            body = event
            
        email = body.get('email')
        
        if not email:
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'Email address is required'
                })
            }
        
        # Subscribe email to SNS topic
        response = sns.subscribe(
            TopicArn=topic_arn,
            Protocol='email',
            Endpoint=email
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Subscription successful! Please check your email to confirm.',
                'subscriptionArn': response['SubscriptionArn']
            })
        }
        
    except ClientError as e:
        print(f"AWS Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Failed to subscribe to notifications'
            })
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }
```
In the code source, click on 'Environment Variables and enter your  value:
Key: SNS_TOPIC_ARN
Value: arn:aws:sns:us-east-1:944355517192:EventNotifications



![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5j75bkqlaq0m8kagkcju.png)

Click on 'Save'

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r04k8jg0ic1m1q96tqln.png)

Click on 'Deploy'

3.2 Create another event Lambda function
Function Name: event-creation-handler
Runtime: Python 3.9


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/tu7j4fj1gzy25a27aye5.png)

Click on 'create function'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8llauuh3tk4mmlzxmmw3.png)

```
Select 'Code', copy the Python code and paste it inside lambda_function.py


import json
import boto3
import os
from datetime import datetime
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    # Initialize SNS client
    sns = boto3.client('sns')
    
    # Get SNS topic ARN from environment variable
    topic_arn = os.environ['SNS_TOPIC_ARN']
    
    try:
        # Parse request body
        if event.get('body'):
            body = json.loads(event['body'])
        else:
            body = event
            
        event_name = body.get('eventName')
        event_description = body.get('eventDescription')
        event_date = body.get('eventDate')
        
        if not all([event_name, event_description, event_date]):
            return {
                'statusCode': 400,
                'headers': {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type',
                    'Access-Control-Allow-Methods': 'POST, OPTIONS'
                },
                'body': json.dumps({
                    'error': 'All event fields are required (eventName, eventDescription, eventDate)'
                })
            }
        
        # Create notification message
        message = f"""
🎉 New Event Alert! 🎉

Event: {event_name}
Description: {event_description}
Date: {event_date}

Don't miss out on this exciting event!

---
This is an automated notification from the Event System.
        """.strip()
        
        # Create subject
        subject = f"New Event: {event_name}"
        
        # Publish to SNS topic
        response = sns.publish(
            TopicArn=topic_arn,
            Message=message,
            Subject=subject
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'message': 'Event created and notifications sent successfully!',
                'messageId': response['MessageId'],
                'event': {
                    'name': event_name,
                    'description': event_description,
                    'date': event_date,
                    'created_at': datetime.now().isoformat()
                }
            })
        }
        
    except ClientError as e:
        print(f"AWS Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Failed to create event or send notifications'
            })
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            'body': json.dumps({
                'error': 'Internal server error'
            })
        }
```

3.3 Environment Variables
For both Lambda functions, add environment variable:

In the code source, click on 'Environment Variables and enter your  value:
Key: SNS_TOPIC_ARN
Value: arn:aws:sns:us-east-1:944355517192:EventNotifications



![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8q0oj034gukvt6cfnqah.png)

Click on 'Save'

The SNS_TOPIC_ARN is an environment variable that you need to set in your Lambda function. It's not something you "find" - you configure it!

You need to set these environment variables for each Lambda function:
For Subscription Handler Lambda:

Key: SNS_TOPIC_ARN
Value: arn:aws:sns:us-east-1:123456789012:EventNotifications

For Event Creation Handler Lambda:

Key: SNS_TOPIC_ARN
Value: arn:aws:sns:us-east-1:123456789012:EventNotifications

Now you have to test both events on your 'Test event'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/w63r4qardfa7tn3dmpat.png)

Enter your event name: 'event-creation-handler'
Your template should be: 'SNS Topic Notification'

Step 4: Create API Gateway
4.1 Create REST API

Go to API Gateway console
Create API → REST API → Build
API Name: EventNotificationAPI
Description: API for event notification system


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/uj9yg3i2mo5t9cmdsvci.png)

Click on 'Create'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/6utidc94lmi8o4refqdt.png)

Click on 'Create API'

4.2 Create Resources and Methods
Resource 1: /subscribe

Actions → Create Resource
Resource Name: subscribe
Actions → Create Method → POST
Integration Type: Lambda Function
Lambda Function: event-subscription-handler
Enable CORS


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/62lmxeb9cg86krbjl9ax.png)

Click on 'create resource'
Enter your resource name: 'subscribe' 
Click on 'Create resource'

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/buzyakjst33qy7c72e43.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/g9615op1utqw4jjrtwob.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ofgakzhp3m8cop5seygo.png)

Click on 'Create method'

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/wyuv1iqz1vz7bfn9ffq8.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/e2p5btfi3pesq0qey12f.png)

Check 'Default 5XX and Post' and click on 'Save' 

You have to create the same API for your 'event-creation-handler'

Resource 2: /create-event

Actions → Create Resource
Resource Name: create-event
Actions → Create Method → POST
Integration Type: Lambda Function
Lambda Function: event-creation-handler
Enable CORS


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/sib2vcqx024piplorw4m.png)

Click on 'Create resource'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/r87elbrvacmsh83iu70z.png)

Click on 'Create method'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/4p7rr2739cdkh7bp470a.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/hju1ziukvyk9o02c5jqr.png)

After you are done with the configurations for both API, click on 'Deploy API'

4.3 Actions → Deploy API
Deployment stage: prod

 
![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/opzfc2zxzmawyalp02d8.png)

Click on 'Deploy'


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ohkzxgo9japnjb1fuubf.png)
After you deployment you will see a Stage.
Note the of Invoke URL

Step 5: Create Frontend
5.1 index.html

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Notification System</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <header>
            <h1>🎉 Event Notification System</h1>
            <p>Stay updated with the latest events!</p>
        </header>

        <main>
            <!-- Subscription Section -->
            <section class="card">
                <h2>📧 Subscribe to Notifications</h2>
                <form id="subscriptionForm">
                    <div class="form-group">
                        <label for="email">Email Address:</label>
                        <input type="email" id="email" name="email" required>
                        <button type="submit">Subscribe</button>
                    </div>
                </form>
                <div id="subscriptionMessage" class="message"></div>
            </section>

            <!-- Event Creation Section -->
            <section class="card">
                <h2>➕ Create New Event</h2>
                <form id="eventForm">
                    <div class="form-group">
                        <label for="eventName">Event Name:</label>
                        <input type="text" id="eventName" name="eventName" required>
                    </div>
                    <div class="form-group">
                        <label for="eventDescription">Description:</label>
                        <textarea id="eventDescription" name="eventDescription" rows="3" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="eventDate">Event Date:</label>
                        <input type="datetime-local" id="eventDate" name="eventDate" required>
                    </div>
                    <button type="submit">Create Event & Notify</button>
                </form>
                <div id="eventMessage" class="message"></div>
            </section>

            <!-- Recent Events Section -->
            <section class="card">
                <h2>📅 Recent Events</h2>
                <div id="eventsList"></div>
            </section>
        </main>
    </div>

    <script src="script.js"></script>
</body>
</html>
```

5.2 styles.css

```
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Arial', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

header {
    text-align: center;
    margin-bottom: 30px;
    color: white;
}

header h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

header p {
    font-size: 1.2rem;
    opacity: 0.9;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}

.card:hover {
    transform: translateY(-2px);
}

.card h2 {
    color: #4a5568;
    margin-bottom: 20px;
    font-size: 1.5rem;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: #4a5568;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

button {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.message {
    margin-top: 15px;
    padding: 12px;
    border-radius: 8px;
    font-weight: bold;
    display: none;
}

.message.success {
    background-color: #f0fff4;
    color: #22543d;
    border: 1px solid #9ae6b4;
}

.message.error {
    background-color: #fff5f5;
    color: #742a2a;
    border: 1px solid #feb2b2;
}

.event-item {
    background-color: #f8f9fa;
    border-left: 4px solid #667eea;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 8px;
}

.event-item h3 {
    color: #4a5568;
    margin-bottom: 8px;
}

.event-item p {
    color: #718096;
    margin-bottom: 5px;
}

.event-date {
    font-weight: bold;
    color: #667eea;
}

.loading {
    text-align: center;
    color: #718096;
    font-style: italic;
}

@media (max-width: 600px) {
    .container {
        padding: 15px;
    }
    
    header h1 {
        font-size: 2rem;
    }
    
    .card {
        padding: 20px;
    }
}
```

5.3 script.js

```
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
        const response = await fetch(`${API_BASE_URL}/subscribe`, {
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
        const response = await fetch(`${API_BASE_URL}/create-event`, {
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
```

5.4 events.json (Sample Data)

```
{
    "events": [
        {
            "id": 1,
            "name": "Welcome to Event System",
            "description": "This is a demo event to show how the notification system works.",
            "date": "2025-06-15T10:00:00",
            "created_at": "2025-06-08T08:00:00Z"
        },
        {
            "id": 2,
            "name": "AWS Workshop",
            "description": "Learn serverless architecture with AWS Lambda, SNS, and API Gateway.",
            "date": "2025-06-20T14:00:00",
            "created_at": "2025-06-07T12:00:00Z"
        },
        {
            "id": 3,
            "name": "Cloud Security Seminar",
            "description": "Best practices for securing your cloud infrastructure.",
            "date": "2025-06-25T16:00:00",
            "created_at": "2025-06-06T10:00:00Z"
        }
    ]
}
```

🪣 Step 6: Deploy to S3
6.1 Create S3 Bucket

# Create bucket (replace with unique name)
aws s3 mb s3://your-event-system-bucket-name

# Or use AWS Console:
# Services → S3 → Create bucket
# Bucket name: your-event-system-bucket-name
# Region: us-east-1 (or your preferred region)


6.2 Enable Static Website Hosting

Go to bucket properties
Static website hosting → Edit → Enable
Index document: index.html
Error document: index.html

6.3 Configure Bucket Policy

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-event-system-bucket-name/*"
        }
    ]
}
```

6.2 
You need to create a bucket to house your files, which will enable Static Website Hosting.
On the console, type 'S3' and click on 'Create bucket'. Give your bucket a name: event-system


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/49u9m0q933c1fc0azbrq.png)

Under object Ownership, select 'ACLs disabled'
Uncheck the 'block public access setting for this bucket'
Enable bucket key
Enable bucket versioning
Click on 'Create bucket'

Go to bucket properties
Static website hosting → Edit → Enable


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/qmu37wgefldscbzjh24m.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/3j17yrmf98yasi5xpodk.png)

Index document: index.html
Error document: index.html

6.3 Configure Bucket Policy

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-event-system-bucket-name/*"
        }
    ]
}
```
Edit your JSON 'Resource' copy and paste your bucket ARN 
arn:aws:s3:::event-systems


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/cgizqymhecfhr73dy3um.png)


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/vh16d5udhol7mp63xqxj.png)

Step 7: Configuration & Testing
7.1 Update API URL
In script.js, replace the API_BASE_URL with your actual API Gateway URL:
javascriptconst API_BASE_URL = 'https://your-api-id.execute-api.us-east-1.amazon


![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5monml0yje1h8cc2chmc.png)

7.2 Test the System

Test Email Subscription:

Visit your S3 website URL
Enter an email address
Check email for SNS confirmation
Confirm subscription


Test Event Creation:

Fill out the event form
Submit the form
Check subscribed emails for notifications



7.3 Monitor with CloudWatch

Lambda function logs
API Gateway metrics
SNS delivery status

 Troubleshooting
Common Issues:
CORS Errors:

Ensure CORS is enabled on API Gateway
Add proper headers in Lambda responses

Lambda Timeout:

Increase timeout in Lambda configuration
Check CloudWatch logs for errors

SNS Not Sending:

Verify IAM permissions
Check topic ARN in environment variables
Confirm email subscriptions are confirmed

S3 Access Denied:

Check bucket policy is correct
Ensure bucket is public for static hosting

🎯 Next Steps & Enhancements

Add DynamoDB: Store events persistently
SMS Notifications: Add SMS support via SNS
User Authentication: Integrate with Amazon Cognito
Event Categories: Add filtering and categorization
Scheduled Events: Use EventBridge for recurring notifications
Analytics: Track user engagement with CloudWatch

🔒 Security Best Practices

Least Privilege: IAM roles with minimal permissions
API Throttling: Configure in API Gateway
Input Validation: Validate all user inputs
HTTPS Only: Ensure all communications are encrypted
Email Validation: Implement proper email format checking

📝 Project Summary
You've built a complete serverless event notification system using:

Frontend: HTML/CSS/JS hosted on S3
API: REST API with API Gateway
Compute: Serverless Lambda functions
Messaging: SNS for email notifications
Security: IAM roles and policies

This project demonstrates real-world AWS architecture patterns and can be extended for production use cases!
Publishing Tips
Ensure your post has a cover image set to make the most of the home feed and social media platforms.
Share your post on social media platforms or with your co-workers or local communities.
Ask people to leave questions for you in the comments. It's a great way to spark additional discussion describing personally why you wrote it or why people might find it helpful.


