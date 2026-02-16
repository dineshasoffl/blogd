const express=require("express");
const app=express();
const { log, error } = require("console");
const multer=require("multer");
const path=require("path");

const cors=require("cors");

app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}));

app.use(express.json());//Enables parsing of JSON data from requests
app.use(express.urlencoded({extended:true}));//Enables form data parsing
app.use(express.static("public"));
app.use("/uploads",express.static("uploads"));

const session=require("express-session");

app.use(session({
    secret:"03102002",
    resave:false,
    saveUninitialized:false,
    cookie:{secure:false}
}))

const mongoose=require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/blogDB")
.then(() => console.log("Connected to MongoDB"))
.catch(error=>console.error("MongoDB connection error:",err));

//Set up storage config for multer
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,"uploads/");//directory to store images
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+path.extname(file.originalname));//unique file name
    }
});

const upload=multer({storage:storage});

const User=require("./models/user");//Import User model

const bcrypt=require("bcrypt");//Import bcrypt

const requireAuth=(req,res,next)=>{
    if(!req.session.user){
        return res.status(401).json({message:"Unauthorized.Please log in."});
    }
    next();//User is logged in,allow access
}

//Register route
app.post("/register",async (req,res) =>{
    try{
        const{username,email,password}=req.body;

        if(!username||!email||!password){
            return res.status(400).json({message:"All fields are required"});
        }
        //check if the user already exists
        const existingUser=await User.findOne({email});
        if (existingUser){
            return res.status(400).json({message:"User already exists.Please log in."});
        }

        //Hash the passowrd before saving
        const saltRounds=10;
        const hashedPassword=await bcrypt.hash(password,saltRounds);

        //Create a new user with the hashed password
        const newUser=new User({
            username,
            email,
            password:hashedPassword,
        });

        await newUser.save();//Save to database

       res.status(201).json({message:"Register sucessful!Please log in."});
    }catch(error){
        console.error("Error registering user:",error);
         res.status(500).send("Error registering user");
    }
});

//Login route
app.post("/login",async(req,res)=>{
        let email=String(req.body.email).trim();
        let password=String(req.body.password).trim();
       
     if(email.length===0||password===0){
            return res.status(400).json({message:"Email and password are required"});
        }

        //Check if user exists
    try{ 
         const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"User not found.please register"});
        }

       //Compare the hashed password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Invalid credentials"});

        }

        //Store user data in session
        req.session.user={
            id:user._id,
            username:user.username,
            email:user.email
        };

        res.status(200).json({message:"Login sucessful!",user:req.session.user});

    }catch(error){
        console.error("Error logging in:",error);
        res.status(500).json({message:"Server error"})
    }
});

app.get("/me",(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({user:null});
    }

    res.json({
        user:{
            id:req.session.user.id,
            username:req.session.user.username,
            email:req.session.user.email,
        },
    });
});

//Logout route
app.post("/logout",(req,res)=>{
    if(req.session){
        req.session.destroy((err)=>{
            if(err){
                console.error("Error logging out:",err);
                return res.status(500).json({message:"Logout failed"});
            }
            res.clearCookie("connect.sid");//Clear session route
            res.json({message:"Logout succesful"});
        });
        
    }else{
            res.status(400).json({message:"No user is logged in"});
        }
});

const Post=require("./models/post");//Import Post model

//Add route
app.post("/add",requireAuth,upload.single("image"),async(req,res)=>{
    if(!req.session.user){
        return res.status(401).json({message:"Unauthorized.Please log in."});
    }
    try{
        const {title,content}=req.body;
        const userId=req.session.user.id;//Get Logged-in user's ID

        if(!title||!content){
            return res.status(400).json({message:"Title and content are required"});
        }
        const image=req.file?req.file.filename:null;

        const newPost=new Post({
            title,
            content,
            image,
            author: userId,
            createdAt:new Date(),
        });
         await newPost.save();
         res.status(201).json({message:"Post created sucessfully",post:newPost});
    }catch(error){
        console.error("Error creating post:",error);
        res.status(500).json({message:"Server error"});
    }
});

//Posts route
app.get("/posts",async(req,res)=>{
    try{
        const posts=await Post.find().populate("author","username id").sort({createdAt:-1});
        res.json(posts);
    }catch(error){
        console.error("Error fetching posts:",error);
        res.status(500).json({message:"Server error"});
    }
});

//Edit route
app.get("/posts/:id",async(req,res)=>{
    try{
        const postId=req.params.id;
        //Check if postId is a valid MongoDB objectId before querying
        if(!postId.match(/^[0-9a-fA-F]{24}$/)){
            return res.status(400).json({mesage:"Invalid post ID format"});
        }
        
        const post=await Post.findById(req.params.id).populate("author","username").populate("comments.author","username");

        if(!post){
            return res.status(404).json({message:"Post not Found"});
        }

        res.json({
            ...post.toObject(),
            authorName:post.author.username,
    });

    }catch(error){
        console.error("Error fetching post:",error);
        res.status(500).json({message:"Server error"});
    }
});

app.put("/posts/:id",requireAuth,upload.single("image"),async(req,res)=>{
    try{
        const{title,content}=req.body;
        const postId=req.params.id;
        const userId=req.session.user.id;

        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"Post not found"});
        }

        if(post.author.toString()!==userId){
            return res.status(403).json({message:"You can only edit your own posts"});
        }

        post.title=title;
        post.content=content;

        if(req.body.removeImage==="true"){
            post.image=null;
        }

        if(req.file){
            post.image="/uploads/"+req.file.filename;
        }
        
        await post.save();
        res.json({message:"Post updated sucessfully"});
    }catch(error){
        console.error("Error updating post:",error);
        res.status(500).json({message:"Server error"});
    }
});

//Delete route
app.get("/posts/:id",async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id).populate("author","username id");

        if(!post){
            return res.status(404).json("Error fetching post:",error);
        }
        res.json(post);
    }catch(error){
        console.error("Error fetching post:",error);
        res.status(500).json({mesage:"Server error"});
    }
});

app.delete("/posts/:id",requireAuth,async(req,res)=>{
    try{
        const postId=req.params.id;
        const userId=req.session.user.id;//Get logged-in userID

        const post=await Post.findById(postId);
        if(!post){
            return res.status(404).json({message:"Post not found"});
        }

        //check if the loggged-in user is the author
        if(post.author.toString()!==userId){
            return res.status(403).json({message:"You can only delete your own posts"});
        }
        await Post.findByIdAndDelete(postId);

        res.json({message:"Post delete sucessfully"});
    }catch(error){
        console.error("Error deleting post:",error);
        res.status(500).json({mesage:"Server error"});    
    }
});

app.post("/posts/:id/like",async(req,res)=>{
    try{
        
        if(!req.session.user){
            return res.status(401).json({message:"Unauthorized.Please Log in"});
        }

        const postId=req.params.id;
        const userId=req.session.user.id;

        const post=await Post.findById(postId).populate("author","username").populate("comments.author","username");
        if(!post)return res.status(404).json({message:"Post not found"});

        const alreadyLiked=post.likes.includes(userId);
        
    if(alreadyLiked){
        post.likes.pull(userId);
    }else{
        post.likes.push(userId);
    }
    await post.save();

    res.json(post);
    }catch(error){
        console.error("Error toggling like:",error);
        res.status(500).json({message:"Server error"});
    }
})

app.post("/posts/:id/comments",async(req,res)=>{
    try{ 
        
        if(!req.session.user){
            return res.status(401).json({mesage:"Unauthorized.Please Log In"});
        }

        const userId=req.session.user.id;
        const postId=req.params.id;

        const {content}=req.body;
        if(!content){
            return res.status(400).json({message:"Comments cannot be empty"});
        }

        const post=await Post.findById(postId);
        if(!post) return res.status(404).json({message:"Post not found"});

        const comment={
            content,
            author:userId
        };

        post.comments.push(comment);
        await post.save();

        const updatedPost=await Post.findById(postId).populate("comments.author","username");
        
        res.status(201).json(updatedPost);

    }catch(error){
        console.error("Error adding comment",error);
        res.status(500).json({message:"Server Error"});
    }
});

app.get("/posts/:id/comments",async(req,res)=>{
    try{
        const postId=req.params.id;
        const post=await Post.findById(postId).populate("comments.author","username");

       if(!post) return res.status(404).json({message:"Post not found"});

       res.json(post.comments);
    }catch(error){
        console.error("Error loading comments",error);
        res.status(500).json({message:"Server Error"});
    }
});

app.delete("/comment/:id",async(req,res)=>{
    try{
        const commentId=req.params.id;
        const userId=req.session.user.id;

        const post=await Post.findOne({"comments._id":commentId});

        if(!post){
            return res.status(404).json({message:"Post not found"});
        }

        const comment=post.comments.id(commentId);

        if(!comment){
            return res.status(404).json({message:"Comment not found"});
        }

        if(comment.author.toString()!==userId){
            return res.status(403).json({message:"Not authorized to delete this comment"});
        }
    
    post.comments.pull(commentId);
    await post.save();

    res.status(200).json({message:"Comment deleted sucessfully"});
    }catch(error){
        console.error("Error deleting comment:",error);
        res.status(500).json({message:"Internal Server Error"})
    }
});

app.get("/myposts",async(req,res)=>{
    try{
        if(!req.session.user){
            return res.status(401).json({message:"Unauthorized.Please Log in"});
        }
    const userId=req.session.user.id;
    const posts=await Post.find({author:userId}).populate("author","username").sort({createdAt:-1});
    res.json(posts); 
 }catch(error){
    console.error("Error fetching user posts:",error);
    res.status(500).json({message:"Server error"});
 }
});

app.get("/check-session", (req, res) => {
    if (req.session && req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

//Start the server
const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server is running on http://localhost:${PORT}`);
});