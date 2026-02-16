const mongoose=require("mongoose");

const postSchema=new mongoose.Schema({
    title:{type:String,required:true},
    content:{type:String,required:true},
    image:{type:String},
    author:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    comments:[
        {
            content:{type:String,required:true},
            author:
                {type:mongoose.Schema.Types.ObjectId,required:true,ref:"User"},
            createdAt:{type:Date,default:Date.now}
        }
    ],
    createdAt:{type:Date,default:Date.now}

});

const Post =mongoose.model("Post",postSchema);
module.exports=Post;