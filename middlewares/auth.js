const authMiddleware = (req, res, next) => {
    const authHeader = req.headers['authorization']

    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' })
    }

    const token = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':')[0]

    if (token === process.env.REAMAZE_API_TOKEN) {
        return next()
    }

    res.status(401).json({ error: 'Invalid authentication token' })
}

module.exports = authMiddleware