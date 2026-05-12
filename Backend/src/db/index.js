import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const connectDb = async() =>{
    try{
        const con = await mongoose.connect(`${process.env.MONGO_DB_URI}${DB_NAME}`);
        console.log(`MongoDB connected! DB HOST: ${con.connection.host}`);
    }
    catch(error)
    {
        console.log("MongoDb connection Failed!..",error);
        process.exit(1);
    }
}

export default connectDb;