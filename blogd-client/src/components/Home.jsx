import {Link} from "react-router-dom";
import {useEffect, useState} from "react";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

function Home(){
    const [posts, setPosts]=useState([]);
    const [loading, setLoading]= useState(true);
     const {showError}=useNotification();

    async function handleLike(postId){
        try{
            const data= await api.post(`/posts/${postId}/like`);

            if(data?.unauthorized){
                showError("Please log in to like posts.");
                return;
            }

            setPosts(prevPosts=>
                prevPosts.map(p=>
                    p._id===postId?data:p
                )
            );
        }catch(err){
            console.error("Like Error:",err);
        }
    }

    useEffect(()=>{
        async function fetchPosts(){
            try{
                const data=await api.get("/posts");
                setPosts(data);
                 }catch(err){
                    console.error("Fetch posts error:",err);
                 }finally{
                    setLoading(false);
                 }
        }

        fetchPosts();
    },[]);

    if (loading) return <p>Loading posts...</p>;

    return(
        <div className="container mt-4">

            <div className="text-center mb-4">
            <h2>Welcome to BlogD</h2>
            <p className="text-muted">
                Are you looking for a place to talk and share your mind?If so,You found it!A place where everything can be logged.
                </p>
            </div>

            {posts.length===0?(
                <div className="alert alert-info text-center">
                No posts yet
                </div>
            ):(
                <div className="row">
                {posts.map((post)=>(
                    <div key={post._id} className="col-md-6 col-lg-4 mb-4">

                        <div className="card shadow-sm">

                         {post.image && (
                        <img 
                        src={post.image}
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
                     className="btn btn-sm btn-outline-danger"
                       onClick={(e)=>{
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(post._id);
                       }}
                       >
                        ❤️ {post.likes?.length||0}
                       </button>
                    </div>
                    </div>

                    <div className="card-footer text-muted small">
                       {post.author?.username}<br/>
                        {new Date(post.createdAt).toLocaleString()}
                        </div>

                        </div>

                        </div>

                     
                ))}
                </div>      
 )}
 </div>
    );
}

export default Home;