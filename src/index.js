import dotenv from "dotenv";
import connectDB from "./db/index.js";
import app from "./app.js";
dotenv.config({
    path: "./.env"
});
connectDB()
.then(() => {
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server listening on port ${process.env.PORT}`);
    });
    app.get("/",(req,res)=>{
        res.send("Hello World");
    })
    app.on("error",(err)=>{
        console.log("Error in server", err);
        process.exit(1);
    })

})
.catch((err)=>{
    console.log("Error connecting to MongoDB", err);
    process.exit(1);
})

