import mongoose, { Mongoose, Schema, Types } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const VideoSchema = new Schema(
  {
    videoFile: {
      Type: String, // cloudinary url
    },
    thumbnail: {
      Type: String, // cloudinary url
      required: true,
    },
    title: {
      Type: String, 
      required: true,
    },
    description: {
      Type: String,
      required: true,
    },
    duration: {
      Type: Number , 
      required: true,
    },
    views:{
        Type:number,
        default:0
    },
    isPublished:{
        Type:Boolean,
        default:true
    },
    owner:{
        Type:Schema.Types.ObjectId,
        ref:"User"
    }


  },
  {
    timestamps: true
  }
);

VideoSchema.plugin(mongooseAggregatePaginate)


export const Video = Mongoose.model("Video",VideoSchema)
