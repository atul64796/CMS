import connectDb from "./src/db/index.js";
import dotenv from "dotenv";
import app from "./src/app.js";
dotenv.config({path: './.env'});

const PORT = process.env.PORT || 8000

connectDb().then(()=>{
    app.listen(PORT,()=>{
        console.log(`Server is  running on PORT ${PORT}`);
    });
});

app.get("/", (req, res) => {
    res.send("Server is running 🚀");
});