const app= require('./app');

const dotenv  = require('dotenv');
const connectDatabase=require('./config/database')

//config
// dotenv.config({path: './config/congig.env'})

//connecting to db
connectDatabase();


app.get('/',(req,res)=>{
    res.send("root is working")
})

app.listen(4000,()=>{
    console.log('listening to port 4000')
})

// app.listen(process.env.PORT,()=>{
//     console.log('listening to port 8080')
// })