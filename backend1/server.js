const app= require('./app');

const dotenv  = require('dotenv');
const connectDatabase=require('./config/database')

//Handling uncaught exception
process.on('uncaughtException',(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to uncaught Exception`);
    process.exit(1);
})

//config
dotenv.config({ path: './config/config.env' });

//connecting to db
connectDatabase();


const server = app.listen(4000,()=>{
    console.log('listening to port 4000')
})


//unhandled promise rejection
process.on("unhandledRejection",err=>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server due to unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1);
    })

})