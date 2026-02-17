import {useEffect, useState} from "react";
import {useAuth} from "../context/AuthContext";
import {Link} from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

function MyPosts(){
    const {user}=useAuth();
    const {showSuccess,showError}=useNotification();

    const [posts, setPosts]=useState([]);
    const [loading,setLoading]=useState(true);
    const [confirmOpen,setConfirmOpen]=useState(false);
    const [postToDelete,setPostToDelete]=useState(null);

       async function handleLike(postId){
        try{
            const data= await api.post(`/posts/${postId}/like`);

            setPosts(prevPosts=>
                prevPosts.map(p=>
                    p._id===postId?data:p
                )
            );
        }catch(err){
            console.error("Like Error:",err);
        }
    }
  function getImageUrl(image){
        if(!image) return null;

        const BASE="https://blogd-backend.onrender.com"

        //already has /uploads
        if(image.startsWith("/uploads")){
            return `${BASE}${image}`;
        }

        //old format
        return `${BASE}/uploads/${image}`
    }

    useEffect(()=>{
        async function fetchMyPosts(){
            try{
               const data=await api.get("/myposts");
                setPosts(data);
            }catch(err){
                console.error("Fetch my posts error:",err)
            }finally{
                setLoading(false);
            }
        }

        if (user)fetchMyPosts();
    },[user]);

    function handleDelete(id){
                setPostToDelete(id);
                setConfirmOpen(true);
     }
    
    if(!user) return <p>Please login to view your posts.</p>
    if (loading) return <p>Loading your posts...</p>

    return(
        <div className="container mt-4">

            <h2 className="mb-4">My Posts</h2>

            {posts.length===0?(
                <div className="alert alert-info">
                You havent created any posts yet.
                </div>
            ):(
                <div className="row">
                {posts.map((post)=>(
                    <div key={post._id} className="col-md-6 col-lg-4 mb-4">

                        <div className="card shadow-sm">
                        
                         {post.image && (
                        <img 
                        src={getImageUrl(post.image)}
                        className="card-img-top"
                        alt="Post Image"
                        style={{height:"200px",objectFit:"cover"}}
                        />
                       )} 

                       <div className="card-body d-flex flex-column">

                       <h5 className="card-title">
                        <Link 
                        to={`/post/${post._id}`}
                        className="text-decoration-none text-dark"
                        >
                        {post.title}
                        </Link>
                        </h5>
                       
                       <p className="card-text">
                        {post.content.length>120
                        ?post.content.slice(0,120)+"..."
                        :post.content}
                        </p>

                        <div className="mt-auto">

                        <Link 
                        to={`/post/${post._id}`}
                        className="btn btn-sm btn-primary me-2"
                        >
                        Read More
                        </Link>
  
                    <button 
                    className="btn btn-sm btn-outline-danger me-2"
                       onClick={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(post._id);
                       }}
                       >
                          ❤️{post.likes?.length||0}
                       </button>
                       </div>
                        </div>

                        <div className="card-footer small text-muted">
                        {new Date(post.createdAt).toLocaleString()}
                        </div>

                      {/*Management controls*/}
                       <div className="card-footer bg-light">

                       <Link 
                       to={`/edit-post/${post._id}`}
                       className="btn btn-sm btn-outline-secondary me-2"
                       >
                        Edit
                        </Link>

                         <button 
                         className="btn btn-sm btn-outline-danger"
                         onClick={()=>handleDelete(post._id)}
                             >
                         Delete
                        </button>

                       {confirmOpen && (
                            <div className="modal fade show" style={{display:"block",background:"rgba(0,0,0,0.5)"}}> 
                                <div className="modal-dialog modal-dialog-centered">
                                    <div className="modal-content">
                                         <div className="modal-header">
                                            <h5 className="modal-title">Delete Post</h5>
                                            </div>

                                            <div className="modal-body">
                                                <p>Are you sure you want to delete this post?</p>
                                                </div>

                                                 <div className="modal-footer">
                                                  <button className="btn btn-secondary" onClick={()=>setConfirmOpen(false)}>
                                                     Cancel
                                                    </button>

                                                    <button
                                                    className="btn btn-danger"
                                                    onClick={async()=>{
                                                     try{ 
                                                     const data=await api.delete(`/posts/${postToDelete}`);

                                                        if(data?.message==="Post delete sucessfully"||data?.post) { 
                                                            setPosts(prev=>prev.filter(p=>p._id !== postToDelete));
                                                            showSuccess("Post deleted sucessfully");
                                                         }else{
                                                            showError("Failed to delete Post");
                                                             }
                                                            }catch(err){
                                                             console.error("Delete Error:",err);
                                                            }
                                                                setConfirmOpen(false);
                                                                setPostToDelete(null);
                                                            } }
                                                    >
                                                     Delete
                                                    </button>
                                                </div>
                                        </div>
                                    </div>
                            </div>                  
                         )}
                    </div>

                    </div>

                    </div>
                ))}
                </div>
            )}
        </div>
    );
}

export default MyPosts;