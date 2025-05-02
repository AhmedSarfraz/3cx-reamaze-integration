# Re:amaze 3CX Integration Server

This server integrates 3CX call journaling with Re:amaze customer support platform.

## Features

- Call journal integration with Re:amaze
- Contact lookup by phone number or email
- Automatic contact creation
- Secure authentication
- Detailed logging
- Health check endpoint

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   REAMAZE_API_TOKEN=your_api_token_here
   REAMAZE_BRAND=your_brand_subdomain_here
   PORT=3001
   ```

3. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

### Health Check
- `GET /`
- Returns server status and available endpoints

### Contact Lookup
- `GET /api/lookup`
- Query parameters:
  - `number`: Phone number to search
  - `email`: Email to search
- Authentication required

### Call Journal
- `POST /api/call-journal`
- Required fields:
  - `Caller`: Phone number of the caller
  - `Called`: Phone number that was called
  - `CallType`: Type of call (Inbound/Outbound)
  - `CallStart`: Call start timestamp
  - `CallStatus`: Status of the call
- Optional fields:
  - `CallDuration`: Duration in seconds
  - `RecordingUrl`: URL to call recording
  - `Agent`: Name of the agent
- Authentication required

## Authentication

The server accepts two authentication methods:

1. Bearer Token:
   ```
   Authorization: Bearer YOUR_REAMAZE_API_TOKEN
   ```

2. Basic Auth:
   ```
   Authorization: Basic BASE64(YOUR_REAMAZE_API_TOKEN:X)
   ```

## Example Usage

### Lookup Contact
```bash
curl "https://your-server/api/lookup?number=+1234567890" \
  -H "Authorization: Bearer YOUR_REAMAZE_API_TOKEN"
```

### Create Call Journal
```bash
curl -X POST https://your-server/api/call-journal \
  -H "Authorization: Bearer YOUR_REAMAZE_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "Caller": "+1234567890",
    "Called": "+0987654321",
    "CallType": "Inbound",
    "CallStart": "2024-02-20T10:00:00Z",
    "CallDuration": 60,
    "CallStatus": "Completed",
    "Agent": "John Doe"
  }'
```

## Deployment

The server is ready for deployment on Vercel. Make sure to:

1. Set environment variables in Vercel dashboard
2. Deploy using `vercel --prod`
3. Update your 3CX webhook URL to the new deployment URL

## Error Handling

The server provides detailed error messages with:
- Error type
- Error message
- Timestamp
- Request details
- Stack trace (in development mode)

## Logging

Comprehensive logging includes:
- Request details (method, URL, IP)
- Request body for POST requests
- Query parameters for GET requests
- Authentication attempts
- Error details
- Server status changes 