import {useState} from "react";
import {useAuth} from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api"

function NewPost(){
    const {user}= useAuth();
    const navigate = useNavigate();
    const {showSuccess,showError}=useNotification();

    const [title,setTitle]=useState("");
    const [content,setContent]=useState("");
    const [image,setImage]=useState(null);

    if(!user){
        return <p>Please login to create a post.</p>;
    }

    async function handleSubmit(e){
        e.preventDefault();

        const formData=new FormData();
        formData.append("title",title);
        formData.append("content",content);

        if(image){
            formData.append("image",image);
        }

        try{
            const data=await api.postForm("/add",formData);

            if (data?.message==="Post created sucessfully"||data?.post){
                showSuccess("Post created sucessfully");
                navigate("/");
            }else{
                showError(data?.message||"Failed to create post");
            }} catch(err){
                console.error("Create post error:",err);
                showError("Server error")
            }
        }

        return(
            <div className="d-flex justify-content-center align-items-center" style={{minHeight:"80vh"}}>
                <div className="card shadow p-4" style={{width:"100%",minWidth:"700px"}}>
                
                <h3 className="text-center mb-4">Create New Post</h3>

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">Title</label><br/>
                        <input
                        type="text"
                        className="form-control"
                        value={title}
                        onChange={(e)=>setTitle(e.target.value)}
                        required
                        />
                    </div>

                    <div className="mb-3">
                     <label className="form-label">Upload Image</label>
                    <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e)=>setImage(e.target.files[0])}
                    />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Content</label><br/>
                        <textarea
                        className="form-control"
                        rows="7"
                        value={content}
                        onChange={(e)=>setContent(e.target.value)}
                        required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Create Post
                        </button>
                </form>
            </div>
            </div>
        );
    }

export default NewPost;