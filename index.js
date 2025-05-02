const express = require('express')
const axios = require('axios')
const cors = require('cors')
const moment = require('moment-timezone')

require('dotenv').config()

// Validate environment variables
const requiredEnvVars = ['REAMAZE_USERNAME', 'REAMAZE_API_TOKEN', 'REAMAZE_BRAND']

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`)
    process.exit(1)
  }
})

const app = express()

const username = process.env.REAMAZE_USERNAME
const password = process.env.REAMAZE_API_TOKEN


// Middleware
app.use(express.json())
app.use(cors())

// Simple request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`)
  next()
})

// Authentication middleware
app.use((req, res, next) => {
  const authHeader = req.headers['authorization']

  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':')[0]

  if (token === process.env.REAMAZE_API_TOKEN) {
    return next()
  }

  res.status(401).json({ error: 'Invalid authentication token' })
})

// Health Check
app.get('/', (req, res) => {
  res.send('Server is running')
})

// Contact Lookup
app.get('/api/lookup', async (req, res) => {
  const { number, email } = req.query

  if (!number && !email) {
    return res.status(400).json({ error: 'Missing number or email parameter' })
  }

  try {
    const searchTerm = email || number
    const searchType = email ? 'email' : 'mobile'

    const response = await axios.get(
      `https://${process.env.REAMAZE_BRAND}.reamaze.io/api/v1/contacts?q=${searchTerm}&type=${searchType}`,
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    let contact = response.data.contacts?.[0] || null

    if (contact) {
      contact.contactUrl = `https://${process.env.REAMAZE_BRAND}.reamaze.com/admin/users/${contact._id}`
      res.json({ contact })
    } else {
      res.status(404).json({ error: 'Contact not found' })
    }
  } catch (error) {
    console.error('Lookup error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create Contact
app.post('/api/create-contact', async (req, res) => {
  const { mobile } = req.body

  try {
    const response = await axios.post(
      `https://${process.env.REAMAZE_BRAND}.reamaze.io/api/v1/contacts`,
      {
        name: `3cx-${mobile}`,
        mobile: mobile,
        notes: 'Created from 3CX API',
      },
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    return res.json({ success: true, contactId: response.data._id })
  } catch (error) {
    console.error('Create contact error:', error.message)
    return res.status(500).json({ error: 'Failed to create contact' })
  }
})

// Call Journal
app.post('/api/call-journal', async (req, res) => {
  try {
    console.log("req.body", req.body)
    const { number, direction, durationSeconds, callStartTimeUTC, callEndTimeUTC, agentFirstName, agentEmail } = req.body

    // Parse times as UTC and convert to EDT
    const startTimeEDT = moment.utc(callStartTimeUTC, 'MM/DD/YYYY HH:mm:ss')
      .tz('America/New_York')
      .format('MM/DD/YYYY HH:mm:ss')

    const endTimeEDT = moment.utc(callEndTimeUTC, 'MM/DD/YYYY HH:mm:ss')
      .tz('America/New_York')
      .format('MM/DD/YYYY HH:mm:ss')

    const minutes = Math.floor(durationSeconds / 60)
    const seconds = durationSeconds % 60

    // Find or create contact
    const contactResponse = await axios.get(
      `https://${process.env.REAMAZE_BRAND}.reamaze.io/api/v1/contacts?q=${number}&type=mobile`,
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    let contact = contactResponse.data.contacts?.[0]

    if (!contact || !contact.email) {
      return res.status(404).json({ error: 'Contact not found' })
    }

    let converstaion_body = `Call Details: \n\nType: ${direction} \nStart Time: ${startTimeEDT} \nDuration: ${minutes}mins ${seconds}secs \nEnd Time: ${endTimeEDT}`
    if (direction == "Outbound" && agentFirstName && agentEmail)
      converstaion_body += `\nAgent: ${agentFirstName} - (${agentEmail})`

    let payload = {
      conversation: {
        subject: `3CX Call: ${number}`,
        category: 'support',
        message: {
          body: converstaion_body,
        },
        user: { name: contact.name, email: contact.email }
      }
    }

    console.log("payload", payload)

    // Create conversation
    const conversation = await axios.post(
      `https://${process.env.REAMAZE_BRAND}.reamaze.io/api/v1/conversations`,
      payload,
      {
        auth: {
          username: username,
          password: password
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )

    return res.json({ success: true })
  } catch (error) {
    console.error('Call journal error:', error.message)
    if (error.response) {
      console.error('Response data:', error.response.data)
    }
    return res.status(500).json({
      error: 'Failed to process call',
      details: error.response?.data || error.message
    })
  }
})

// Export for Vercel
module.exports = app

if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}
