//This file contains the server
// Express is setup and routes are set up for posting

const express = require('express')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user-router')
const taskRouter = require('./routers/task-router')
require('./db/mongoose.js')

const app = express()
const PORT = process.env.PORT

// Middleware Challenge
//======================================
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET is disabled')
//     } else {
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('The site is currently undergoing maintenance. Please check back at (1 PM UTC)')
// })

// Multer file uploading challenge
// =======================================
const multer = require('multer')
const upload = multer({
    dest: 'images'
})
app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
})

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(PORT, (result) => {
    console.log('Listening on port',PORT)
})

// bcrypt password encryption challenge
// =======================================
// const bcrypt = require('bcryptjs')

// const test = async () => {
//     const pass = "asdf12345"
//     const hashedPass = await bcrypt.hash(pass, 8)
//     console.log(pass, " | ", hashedPass)
//     const areEqual = await bcrypt.compare(pass, hashedPass)
//     console.log(areEqual)
// }
// test()