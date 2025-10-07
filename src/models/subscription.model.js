import mongoose from "mongoose";


const subscriptionSchema = new Schema({
    subscriber:{
        type : Schema.types.ObjectId, // one who is subscribing
        ref:"User"
    },
    channer:{
        type:Schema.Types.ObjectId, // one to whom sunbribing
        ref:"User"
    }
},{timestamps:true})


export const subscription = mongoose.model("Subscription",subscriptionSchema )