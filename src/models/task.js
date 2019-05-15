const mongoose = require('mongoose')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    owner: {
        //An ObjectId object is used by mongoose to generate an _id for each object created using the mongoose.model
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' //This means that the owner property of this 'Task' model should be a reference to the 'User' model. And it will user the ObjectId automatically
                    //to find that referenced user when you use task.populate('owner').execPopulate()

    }
},{
    timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task