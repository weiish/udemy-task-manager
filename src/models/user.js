const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')


const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Password must not contain password')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

//Sets up mongoose middleware to run before the 'save' function is used on this schema
userSchema.pre('save', async function(next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

userSchema.pre('remove', async function(next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

userSchema.virtual('tasks', {
    ref: 'Task', //Mongoose Model string
    localField: '_id', //The identifying field in the current schema that should match
    'foreignField': 'owner' //The identifying field in the 'Task' schema that should match the localField
})


//Sets up a custom function that can be run on any objects created with this mongoose model

//This is an INSTANCED function, meaning it is run on a specific instance of the user model, and will have different effects depending on which user it is run on.
userSchema.methods.generateAuthToken = async function() {
    const user = this
    const token = await jwt.sign({_id: user._id.toString()}, process.env.JWT_SECRET)
    user.tokens.push({token})
    await user.save()
    return token
}


//toJSON is called whenever JSON.stringify() is used on an object. Therefore, by defining this, whenever we use response.send(user), express stringifies it automatically, 
//which causes this function to run and delete the sensitive information
userSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}


//Static methods
//This is a model function, meaning it simply runs from user model and is not specific to an instance
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email})
    if (!user) {
        throw new Error('Unable to login')
    }

    const isValidLogin = await bcrypt.compare(password, user.password)

    if (!isValidLogin) {
        throw new Error('Unable to login')
    }

    return user
}

const User = mongoose.model('User', userSchema)

module.exports = User