require('../src/db/mongoose')
const Task = require('../src/models/task')

const _id = "5cc8d0b5d0929538f0e7914c"

const DoThings = async () => {
    const result = await Task.findByIdAndDelete(_id)
    console.log(result)
    const remainingTasks = await Task.countDocuments( {completed:false})
    console.log(remainingTasks)
}

DoThings()
// Task.findByIdAndDelete(_id).then(() => {
//     console.log("Task with id = ",_id," deleted")
//     return Task.countDocuments( {completed: false} )
// }).then((count) => {
//     console.log("Tasks remaining: ",count)
// }).catch((e) => {
//     console.log(e)
// })