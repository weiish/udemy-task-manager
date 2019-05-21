const jwt = require('jsonwebtoken')
const User = require('../models/user')

//This is middleware to be run before every route that should require authentication to be run.
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({_id: decodedToken._id, 'tokens.token': token}) //Why 'tokens.token'? because tokens is an array of objects that contain an _id and a token property

        if (!user) {
            throw new Error()
        }

        req.user = user //Why this? This is to store the user as a variable in the requests so it can be accessed by the route handlers that use auth
        req.token = token
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

module.exports = auth