const jwt = require('jsonwebtoken')
const User = require('../models/user')

//This is middleware to be run before every route that should require authentication to be run.
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '')
        const decodedToken = jwt.verify(token, 'thisisasecret')
        const user = await User.findOne({_id: decodedToken._id, 'tokens.token': token}) //Why 'tokens.token'?

        if (!user) {
            throw new Error()
        }

        req.user = user //Why this?
        next()
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.'})
    }
}

module.exports = auth