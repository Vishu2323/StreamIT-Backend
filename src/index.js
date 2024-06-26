import connectDB from "./db/index.js"
import 'dotenv/config'
import { app } from "./app.js"

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is runnning at PORT:${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("MongoDB connection failed",err);
})