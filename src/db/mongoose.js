const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})


// const todo1 = new Task({
//     description: 'Cook dinner',
//     trim: true,
//     completed: false
// })

// todo1.save().then((result) => {
//     console.log('Success!', result)
// }).catch((error) => {
//     console.log('Error!', error)
// })

// const me = new User({
//     name: 'Wei',
//     email: '     asdf@asdf.com  ',
//     password: 'testpasswrd',
//     age: 5
// })

// me.save().then((result) => {
//     console.log('Success!',result)
// }).catch((error) => {
//     console.log('Error!',error)
// })