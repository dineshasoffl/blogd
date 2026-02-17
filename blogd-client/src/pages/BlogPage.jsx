import { useParams } from "react-router-dom";
import { useEffect,useState } from "react";
import {useAuth} from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

function BlogPage(){
    const {user}=useAuth();
    const {id}=useParams();
    const {showError}=useNotification();

    const [post,setPost]=useState(null);
    const [loading,setLoading]=useState(true);
    const[newComment,setNewComment]=useState("");
  
   async function handleAddComment(e) {
        e.preventDefault();

        if(!newComment.trim()) return;

        try{
            const data=await api.post(`/posts/${post._id}/comments`,{
                content: newComment,
            });

            if(data?.unauthorized){
                showError("Please log in to comment.");
                return;
            }

            setPost(data);
            setNewComment("");

        }catch(err){
            console.error("Comment error:",err);
        }    
    }

    async function handleDeleteComment(commentId) {
        try{
            await api.delete(`/comment/${commentId}`)

            //remove from state instantly
            setPost(prev=>({
                ...prev,
                comments:prev.comments.filter(c=>c._id!==commentId)
            }));
        }catch(err){
            console.error("Delete comment error:",err)
        }
        
    }
      async function handleLike(){
        if(!post?._id){
            console.error("Post ID is missing:",post);
            return;
        }
           try{
                const data=await api.post(`/posts/${post._id}/like`)
                
            if(data?.unauthorized){
                showError("Please log in to like posts.");
                return;
            }

                setPost(data);

            }catch(err){
                console.error("Like Error:",err);
                setLoading(False);
            }
      }

    useEffect(()=>{
        async function fetchPost(){
            try{
                const data=await api.get(`/posts/${id}`);

                if(data?.unauthorized){
                setPost(null);
                setLoading(false);
                return;
                }

                setPost(data);
                setLoading(false);

            }catch(err){
                console.error("Error fetching post:",err); 
            }
        }

        fetchPost();
    },[id]);

    if(loading) return <p>Loading...</p>;
    if (!post) return <p>Post not found</p>;

    return(
        <div className="container mt-4" style={{maxWidth:"900px"}}>

            {/*Title*/}
            <h1 className="mb-2">{post.title}</h1>

              {/*Author*/}
            <p className="text-muted mb-3">
                By {post.author.username}•{new Date(post.createdAt).toLocaleString()}
            </p>

            {/*Hero Image*/}
            {post.image && (
                <div className="mb-4">
                <img
                src={post.image}
                alt="Post Image"
                className="img-fluid rounded"
                style={{width:"100%",maxHeight:"400px",objectFit:"cover"}}
                />
                </div>
            )}

            {/*Content*/}
            <div className="mb-4" style={{lineHeight:"1.7",fontSize:"1.05rem"}}>
            <p>{post.content}</p>
            </div>

            {/*Like Section*/}
            <div className="mb-4">
            <button className="btn btn-outline-danger" onClick={handleLike}>
                  ❤️{post.likes?.length||0}
            </button>
            </div>

            <hr className="my-4"/>

            {/*Comments*/}
            <h4 className="mb-3">Comments</h4>

            <form onSubmit={handleAddComment} className="mb-4">
                <textarea
                className="form-control mb-2"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e)=> setNewComment(e.target.value)}
                rows="3"
               required
                />

                <button type="submit" className="btn btn-primary">
                    Comment
                </button>
            </form>

            {post.comments?.length === 0 && (
                <p className="text-muted">No comments yet</p>
                )}

            {post.comments?.map((comment)=>(
            <div
                 key={comment._id} 
               className="border-bottom pb-3 mb-3"
                    >
                    
                    <div className="d-flex justify-content-between align-items-center">
                    <strong>{comment.author?.username}</strong>
 
 
                    {comment.author?._id===user?.id &&(
                        <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={()=>handleDeleteComment(comment._id)}
                        
                    >
                Delete
            </button>
        )} 
            </div>

                    <p className="mb-1 mt-2">{comment.content}</p>

                    <small className="text-muted">
                        {new Date(comment.createdAt).toLocaleString()}
                    </small>         
                </div>  
))}
        </div>  
    );
}

export default BlogPage;