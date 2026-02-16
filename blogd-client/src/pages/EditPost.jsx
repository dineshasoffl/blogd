import {useEffect,useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api"

function EditPost(){
    const {id}=useParams();
    const navigate=useNavigate();
    const {showSuccess,showError}=useNotification();

    const [title,setTitle]=useState("");
    const [content, setContent]=useState("");
    const [image,setImage]=useState(null);
    const [existingImage,setExistingImage]=useState(null);
    const [removeImage,setRemoveImage]=useState(false);
    const [loading,setLoading]=useState(true);

    function getImageUrl(image){
        if(!image) return null;

        //already has /uploads
        if(image.startsWith("/uploads")){
            return `http://localhost:3000${image}`;
        }

        //old format
        return `http://localhost:3000/uploads/${image}`
    }

    useEffect(()=>{
        async function fetchPost(){
            try{
                  const data=await api.get(`/posts/${id}`);
                if(!data||data?.message==="Post not Found"){
                    throw new Error("Failed to fetch post")
                }
                setTitle(data.title);
                setContent(data.content);
                setExistingImage(data.image)
            }catch(err){
                console.error("Fetch post error:",err);
            }finally{
                setLoading(false);
            }
        }

        fetchPost();
    },[id]);

    async function handleSubmit(e){
        e.preventDefault();

        const formData=new FormData();
        formData.append("title",title);
        formData.append("content",content);

        if(image){
            formData.append("image",image);
        }

        if(removeImage){
            formData.append("removeImage","true");
        }

        try{
            const data=await api.putForm(`/posts/${id}`,formData);

            if(data?.post||data?.message==="Post updated sucessfully"){
                showSuccess("Post updated sucessfully");
                navigate("/my-posts");
            }else{
                showError("Failed to update post");
            }
        }catch(err){
            console.error("Update error:",err);
        }
    }

        if (loading) return <p>Loading...</p>;
        
         return(
            <div className="d-flex justify-content-center align-items-center" style={{minHeight:"80vh"}}>
                    <div className="card shadow p-4" style={{width:"100%",minWidth:"700px"}}>

                <h3 className="text-center mb-4">Edit Post</h3>
  
            <form onSubmit={handleSubmit}>

                {/*Title*/}
                <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e)=>setTitle(e.target.value)}
                    required
                    />
                    </div>

                    {/*Existing Image*/}
                    {existingImage && !removeImage &&(
                        <div className="mb-3">
                            <label className="form-label">Current Image</label>
                            <div className="mb-2">
                            <img
                            src={getImageUrl(existingImage)}
                            alt="Current Post Image"
                            className="img-fluid rounded"
                            style={{maxHeight:"200px",objectFit:"cover"}}
                            />
                            </div>

                            <div className="form-check">
                                <input
                                type="checkbox"
                                className="form-check-input"
                                id="removeImage"
                                onChange={(e)=>setRemoveImage(e.target.checked)}
                                />
                            <label className="form-check-label" htmlfor="removeImage">
                                Remove Current Image
                            </label>
                            </div>
                        </div>
                    )}

                    {/*Upload new image*/}
                    <div className="mb-3">
                    <label className="form-label">Upload New Image</label>
                    <input
                    type="file"
                    className="form-control"
                    accept="image/*"
                    onChange={(e)=>setImage(e.target.files[0])}
                    />
                    </div>

                    {/*content*/}
                    <div className="mb-3">
                        <label className="form-label">Content</label>
                    <textarea
                    className="form-control"
                    rows="7"
                    value={content}
                    onChange={(e)=>setContent(e.target.value)}
                    required
                    />
                    </div>
                    
                    {/*submit*/}
                    <button type="submit" className="btn btn-primary w-100">
                        Update Post
                         </button>    

                </form>

            </div>
            </div>
        );
    
}

export default EditPost;