const express = require('express')
const { v4: uuidv4 } = require('uuid')
const axios = require('axios')
const { reamaze } = require('../config/env')

const router = express.Router()

// Contact Lookup
router.get('/', async (req, res) => {
    const { number, email } = req.query

    if (!number && !email) {
        return res.status(400).json({ error: 'Missing number or email parameter' })
    }

    try {
        const searchTerm = email || number
        const searchType = email ? 'email' : 'mobile'

        const response = await axios.get(
            `https://${reamaze.brandName}.reamaze.io/api/v1/contacts?q=${searchTerm}&type=${searchType}`,
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

        let contact = response.data.contacts?.[0] || null

        if (contact) {
            contact.contactUrl = `https://${reamaze.brandName}.reamaze.com/admin/users/${contact._id}`

            return res.json({ success: true, contact: contact })
        } else if (number) {
            let payload = {
                contact: {
                    id: uuidv4(),
                    name: `3cx Caller - ${number}`,
                    mobile: number,
                    notes: ['Created from 3CX API']
                }
            }

            const response = await axios.post(
                `https://${reamaze.brandName}.reamaze.io/api/v1/contacts`, payload,
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
            contact = response.data
            contact.contactUrl = `https://${reamaze.brandName}.reamaze.com/admin/users/${contact._id}`

            return res.json({ success: true, contact: contact })
        } else {
            return res.status(404).json({ error: 'Contact not found' })
        }
    } catch (error) {
        console.error('Lookup error:', error.message)
        return res.status(500).json({ error: 'Server error' })
    }
})

module.exports = router 