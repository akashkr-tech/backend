// src/index.js - Remove console logs
import dotenv from "dotenv"
import connectDB from "./db/index.js";
import express from "express";
import userRouter from "./routes/user.routes.js";

dotenv.config({
    path:'./env'
})

const app = express();
app.use(express.json());
app.use('/api/v1/users', userRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    })
}).catch((err)=>{
    console.log("MONGO db connection failed !!!", err);
})

// console.log("MONGO db connection failed !!!", err);