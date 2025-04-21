import dotenv from 'dotenv'
import connectDB from './db/index.js'
import app from './app.js'
dotenv.config()



connectDB()
.then(()=>{
    console.log("Connected to the database successfully")
    // app.on('error', (error) => {
    //     console.error('Error occurred from express:', error);
    // });
    const PORT =process.env.PORT || 5000
    app.listen(PORT,()=>{
        console.log(`⚙️\b Server is running on port ${PORT}`)
    })
})
.catch((error)=>{
    console.log("Error connecting to the database : ",error.message)
})