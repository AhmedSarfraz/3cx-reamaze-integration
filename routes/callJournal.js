const express = require('express')
const moment = require('moment-timezone')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const crypto = require('crypto')
const { SHARED_SECRET, CHANNEL_NUMBER } = require('../config/constants')
const { reamaze } = require('../config/env')

const router = express.Router()

router.post("/", async (req, res) => {
    try {
        console.log("req.body", req.body)
        const { number, direction, durationSeconds, callStartTimeUTC, callEndTimeUTC, agentFirstName, agentEmail } = req.body

        // Find or create contact
        const contactResponse = await axios.get(
            `https://${reamaze.brandName}.reamaze.io/api/v1/contacts?q=${number}&type=mobile`,
            {
                auth: {
                    username: reamaze.username,
                    password: reamaze.apiToken
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        )

        let contact = contactResponse.data.contacts?.[0]

        // Parse times as UTC and convert to EDT
        const startTimeEDT = moment.utc(callStartTimeUTC, 'MM/DD/YYYY HH:mm:ss')
            .tz('America/New_York')
            .format('MM/DD/YYYY HH:mm:ss')

        const endTimeEDT = moment.utc(callEndTimeUTC, 'MM/DD/YYYY HH:mm:ss')
            .tz('America/New_York')
            .format('MM/DD/YYYY HH:mm:ss')

        const minutes = Math.floor(durationSeconds / 60)
        const seconds = durationSeconds % 60

        let _body = `Call Details: \n\nType: ${direction} \nStart Time: ${startTimeEDT} \nDuration: ${minutes}mins ${seconds}secs \nEnd Time: ${endTimeEDT}`
        if (direction == "Outbound" && agentFirstName && agentEmail)
            _body += `\nAgent: ${agentFirstName} - (${agentEmail})`

        let payload = {
            id: uuidv4(),
            direction: direction.toLowerCase(),
            to: {
                name: direction === "Inbound" ? "3CX" : (contact && contact.name ? contact.name : `3cx Caller - ${number}`),
                phone: direction === "Inbound" ? CHANNEL_NUMBER : number
            },
            from: {
                name: direction === "Inbound" ? (contact && contact.name ? contact.name : `3cx Caller - ${number}`) : "3CX",
                phone: direction === "Inbound" ? number : CHANNEL_NUMBER
            },
            body: _body,
            created_at: moment().format('YYYY-MM-DDTHH:mm:ssZ'),
        }
        console.log("payload", payload)
        payload = JSON.stringify(payload)

        // Generate HMAC-SHA256 signature
        let hmac_signature = crypto.createHmac('sha256', SHARED_SECRET).update(payload).digest('base64')

        const response = await axios.post(`https://${reamaze.brandName}.reamaze.io/incoming/voice`, payload, {
            auth: {
                username: reamaze.username,
                password: reamaze.apiToken
            },
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Reamaze-Hmac-SHA256': hmac_signature
            }
        })

        return res.json({ success: true, response: response.data })
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

module.exports = router 