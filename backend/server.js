const dotenv  = require('dotenv');
const app= require('./app');


//config
dotenv.config({path: 'backend/config/config.env'})

app.listen(process.env.PORT , ()=>{
    console.log('server is working on localhost 8080')
})

