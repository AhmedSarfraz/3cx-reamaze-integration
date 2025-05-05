const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()


const { authMiddleware, loggingMiddleware } = require('./middlewares') // Import middlewares
const { healthRoutes, lookupRoutes, callJournalRoutes } = require('./routes') // Import routes

// Middleware
app.use(express.json())
app.use(cors())
app.use(loggingMiddleware)
// app.use(authMiddleware)

// Routes
app.use('/', healthRoutes)
app.use('/api/lookup', lookupRoutes)
app.use('/api/v1/call-journal', callJournalRoutes)


if (require.main === module) {
  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
}

// Export for Vercel
module.exports = app