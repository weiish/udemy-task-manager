//This file contains the server
// Express is setup and routes are set up for posting

const express = require('express')
const User = require('./models/user')
const Task = require('./models/task')
const userRouter = require('./routers/user-router')
const taskRouter = require('./routers/task-router')
require('./db/mongoose.js')

const app = express()
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

module.exports = app