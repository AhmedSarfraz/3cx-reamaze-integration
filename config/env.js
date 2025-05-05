const requiredEnvVars = ['REAMAZE_USERNAME', 'REAMAZE_API_TOKEN', 'REAMAZE_BRAND']

// Validate environment variables
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Missing required environment variable: ${envVar}`)
        process.exit(1)
    }
})

module.exports = {
    reamaze: {
        username: process.env.REAMAZE_USERNAME,
        apiToken: process.env.REAMAZE_API_TOKEN,
        brandName: process.env.REAMAZE_BRAND,
    },
    server: {
        port: process.env.PORT || 3000,
    }
} 