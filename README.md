# 📞 3CX - Re\:amaze Integration

This project provides a Node.js-based integration between **3CX Phone System** and **Re****:amaze**, allowing you to:

- Lookup existing contacts in Re\:amaze by phone number or email.
- Create new Re\:amaze contacts from 3CX call logs.
- Automatically log call journal entries (inbound/outbound) as Re\:amaze conversations.

---

## 🚀 Features

- 🔍 **Contact Lookup** — Search Re\:amaze contacts by phone or email
- ➕ **Create Contact** — Add a new contact in Re\:amaze with a 3CX mobile number
- 🗂️ **Log Call History** — Send call metadata (start time, duration, agent, etc.) to Re\:amaze as a conversation
- 🌐 **CORS-enabled** and includes simple **API Key-based auth**

---

## 🛠 Tech Stack

- Node.js (Express.js)
- Axios (for external API calls)
- Moment-Timezone (for date/time conversion to EDT)
- Dotenv (environment variable config)

---

## 🔧 Setup Instructions

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/3cx-reamaze-integration.git
cd 3cx-reamaze-integration
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
REAMAZE_USERNAME=your_reamaze_email
REAMAZE_API_TOKEN=your_reamaze_api_token
REAMAZE_BRAND=your_reamaze_subdomain (e.g., mycompany if your URL is mycompany.reamaze.io)
PORT=3000
```

4. **Run the server**

```bash
node index.js
```

---

## 🔐 Authentication

All API requests require an `Authorization` header with a base64-encoded token:

```bash
Authorization: Basic base64(api_token:dummy)
```

Only the **token** part is validated for now.

---

## 📡 API Endpoints

### `GET /api/lookup`

**Lookup a contact by phone or email**

**Query Parameters:**

- `number` (optional)
- `email` (optional)

Returns a contact object and contact URL if found.

---

### `POST /api/create-contact`

**Create a new contact using a mobile number**

**Body Parameters:**

```json
{
  "mobile": "+1234567890"
}
```

---

### `POST /api/call-journal`

**Log a call event as a Re****:amaze**** conversation**

**Body Parameters:**

```json
{
  "number": "+1234567890",
  "direction": "Inbound" | "Outbound",
  "durationSeconds": 120,
  "callStartTimeUTC": "04/29/2025 18:00:00",
  "callEndTimeUTC": "04/29/2025 18:02:00",
  "agentFirstName": "John",
  "agentEmail": "john@example.com"
}
```

Adds a conversation entry with formatted details in Re\:amaze.

---

## 🧪 Testing

You can test endpoints using tools like **Postman** or **curl**. Make sure your Authorization header is correct and your `.env` is populated.

---

## 🧼 Logging

- All incoming requests are timestamped.
- Errors are logged to console with full Re\:amaze API response (if available).

---

## 📦 Deployment

Supports deployment on platforms like **Vercel** or **Render**. Make sure to configure environment variables via their respective UI.

---

## 📬 Support / Issues

For issues, bugs, or feature requests, please open a GitHub Issue.

---

## 📄 License

MIT License

---

> Built with ❤️ to automate call insights into Re\:amaze

