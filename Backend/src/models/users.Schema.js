import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    fullname : {
        type:String,
        required:true,
        trim: true,
    },
    email :{
        type:String,
        required:true,
        unique: true,
        index: true,
        trim: true,
        lowercase: true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    role:{
        type:String,
        enum:["teacher","admin","student"],
        default:"student"
    },
    rollNumber:{
        type:String,
        required:true,
        unique:true,
        index:true
    },
    isVerified:{
       type:Boolean,
        default:false
    },
    isBanned: {           //check account ban or unban
    type: Boolean,
    default: false,
  },

  accountStatus: {     //cuurnt status of account ban or unban
    type: String,
    enum: ["active", "deactivated"],
    default: "active",
  },
    faceData: {
    type: [Number],   // array of numbers (128 values)
    default: [],
  },
  avatar:{
    type:String,
    default:""
  },
    refreshToken:{
        type:String
    },
},{timestamps:true})


userSchema.pre('save',async function(){
    if(!this.isModified('password')){
        return ;
    }
    this.password = await bcrypt.hash(this.password,10);

})

//Check password correct or not
userSchema.methods.isPasswordCorrect = async function (password) {
    console.log("this is your password",this.password)
    return await bcrypt.compare(password,this.password); //compare previous password with new

}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign
    (
        {
            _id:this._id,   //store in token
            email:this.email,
            role:this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    );
}

//Refresh Token (used to get new access token)
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign
    (
        {
            _id:this._id,
            role:this.role
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    );
}



export default mongoose.model("UsersSchema",userSchema);
