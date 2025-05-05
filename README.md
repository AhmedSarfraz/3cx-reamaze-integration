# 📞 3CX to Re:amaze Integration

This project integrates **3CX Phone System** with **Re:amaze** using Node.js to:

- Lookup or create Re:amaze contacts from 3CX.
- Log call activity using Re:amaze's **custom voice channel API**.

It exposes a small HTTP API which is configured as a **custom CRM template inside 3CX**.

---

## 🔧 Setup Instructions

1. **Clone and install**

```bash
git clone https://github.com/your-org/3cx-reamaze-integration.git
cd 3cx-reamaze-integration
npm install
```

2. **Environment Variables**

Create a `.env` file:

```env
REAMAZE_USERNAME=your_reamaze_username
REAMAZE_API_TOKEN=your_reamaze_api_token
REAMAZE_BRAND=your_subdomain  # e.g. "mycompany" if your domain is mycompany.reamaze.io
PORT=3000
```

3. **Start the Server**

```bash
node index.js
```

You should see: `Server running on port 3000`

---

## 🔐 Authentication

All API requests must include a **Base64-encoded token** in the Authorization header:

```
Authorization: Basic BASE64_TOKEN
```

The `BASE64_TOKEN` must decode to `REAMAZE_API_TOKEN:anything`. Only the token part is checked.

---

## 🚀 API Endpoints

### `GET /api/lookup`
**(Used as the lookup endpoint in 3CX CRM template)**

This is actually a **get-or-create** endpoint:

- It checks if a contact exists in Re:amaze using phone number or email.
- If not found and a phone number is provided, it creates the contact on the fly.
- Returns a contact object so 3CX proceeds to the next step (call logging).

**Query Params:**
- `number` (required if `email` not given)
- `email` (optional)

**Success Response:**
```json
{
  "success": true,
  "contact": {
    "name": "3cx Caller - +15555551234",
    "contactUrl": "https://<brand>.reamaze.com/admin/users/<id>"
  }
}
```

---

### `POST /api/v1/call-journal`
**(Used for logging calls via 3CX call journal)**

Uses the **Re:amaze custom voice channel** to log call data.
This works even if the contact has no email, and allows voice events to be grouped by thread.

- Creates a voice message in Re:amaze for the given call.
- HMAC is generated and sent in the `X-Reamaze-Hmac-SHA256` header.

**Request Headers:**
- `Authorization: Basic BASE64_TOKEN`

**Sample Body Dictionary for 3CX:**
Paste this dictionary into your 3CX Call Journaling setup:

```json
{
  "number": "[Number]",
  "direction": "[CallDirection]",
  "type": "[CallType]",
  "name": "[Name]",
  "entityType": "[EntityType]",
  "agent": "[Agent]",
  "agentFirstName": "[AgentFirstName]",
  "agentLastName": "[AgentLastName]",
  "agentEmail": "[AgentEmail]",
  "durationSeconds": "[DurationSeconds]",
  "durationMinutes": "[DurationMinutes]",
  "dateTime": "[DateTime]",
  "callStartTimeUTC": "[CallStartTimeUTC]",
  "callEstablishedTimeUTC": "[CallEstablishedTimeUTC]",
  "callEndTimeUTC": "[CallEndTimeUTC]",
  "subject": "[Subject]",
  "inboundCallText": "[InboundCallText]",
  "missedCallText": "[MissedCallText]",
  "outboundCallText": "[OutboundCallText]",
  "notAnsweredOutboundCallText": "[NotAnsweredOutboundCallText]"
}
```

**Success Response:**
```json
{
  "success": true,
  "response": {
    ...reamaze response...
  }
}
```

---

## 🧪 Health Check

```bash
GET /
```
Returns: `Server is running`

---

## 📦 Deploying

You can deploy this to Vercel, Render, or your own server. Make sure to set environment variables.

---

## 🧼 Logging

- Logs all incoming requests and key actions to the console.
- Errors include full stack trace and response details from Re:amaze.

---

## 🛡️ Notes

- Contact creation is skipped if email is missing **unless** using the voice channel.
- Voice channel does not require email — great for unknown callers.
- Uses `moment-timezone` for EDT conversion.
- Uses `crypto` to sign payloads for secure HMAC authentication with Re:amaze.

---

## 📄 License

MIT

---

> Built to make 3CX + Re:amaze call tracking seamless, even for first-time callers.

