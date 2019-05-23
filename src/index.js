//This file contains the server
// Express is setup and routes are set up for posting

const app = require('./app')
const PORT = process.env.PORT

app.listen(PORT, (result) => {
    console.log('Listening on port',PORT)
})