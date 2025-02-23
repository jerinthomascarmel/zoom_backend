import { mongoose, Schema } from "mongoose";

const userSchema=new Schema(
    {
        name:{type:String,required:true},
        username:{type:String,required:true,unique:true},
        password:{type:String,required:true},
        token:{type:String},
        joined_meetings:[{
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }],
        created_meetings: [{
            type: Schema.Types.ObjectId,
            ref: 'Meeting'
        }]
    }
);

const User=mongoose.model("User",userSchema);
export {User};