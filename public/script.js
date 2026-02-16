const showMessage=(message,type="success",duration=5000)=>{
    const messageContainer=document.getElementById("message-container");
   
    if(!messageContainer){
       console.error("message-container not found in HTML!");
       return;
    }
   
    //Create alert div
    const alertDiv=document.createElement("div");
       alertDiv.className=`alert alert-${type} alert-dismissible fade show text-center`
       alertDiv.role="alert";
       alertDiv.innerHTML=`
       ${message}
       <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
       `;
       
       //Add alert to the container
       messageContainer.appendChild(alertDiv);
   
       //Auto-remove alert after duration
       setTimeout(()=>{
           alertDiv.classList.remove("show");
           setTimeout(()=>alertDiv.remove(),500);//Wait for fade effect
       },duration);
   }

document.addEventListener("DOMContentLoaded" , async() => {
    const blogContainer = document.getElementById("blog-posts");

     try{
     const response=await fetch("/posts")
     const posts= await response.json()

        //Fetch the logged in user
        const sessionResponse=await fetch("/check-session");
        const sessionData=await sessionResponse.json();
        const loggedInUser=sessionData.loggedIn?sessionData.user.id:null;
        
        blogContainer.innerHTML="";//Clear previous content

        posts.forEach(post => {
            const postElement = document.createElement("div");
            postElement.classList.add("col-md-6","mb-4");//Bootstrap grid

            const postLink=`blog.html?id=${encodeURIComponent(post._id)}`;
            postElement.innerHTML = `
            <div class="card shadow-sm">
            <div class="card-body">
             <h2 class="card-title">
             <a href="${postLink}" class="post-link text-black text-decoration-none">${post.title}</a>
             </h2>
             ${post.image?`<img src="${post.image.startsWith('/uploads')?post.image:`/uploads/${post.image}`}" class="rounded mb-2" width="200px" alt="Post Image">`:""}          
                <hr>
             <p class="card-text">${post.content.length > 100 ? post.content.substring(0,100)+"...":post.content}</p>
             <a href="blog.html?id=${post._id}" class="btn btn-primary btn-sm">Read More</a>
             <div class="d-flex align-items-center gap-2 mt-2">
             <button class="btn btn-sm btn-outline-danger like-btn" data-id="${post._id}">
             Liked By<span class="like-count">${post.likes.length}</span>
             </button>
             </div>
             <small class="text-muted">By${post.author.username}|${new Date(post.createdAt).toLocaleDateString()}</small>
             </div>
             </div>
            `;
            
        const likeButton=postElement.querySelector(".like-btn")
        likeButton.addEventListener("click",function(){
        const postId=this.dataset.id;

        fetch(`/posts/${postId}/like`,{
            method:"POST",
            headers:{"Content-Type":"application/json"}
        })
        .then(res=>res.json())
        .then(data=>{
            this.querySelector(".like-count").textContent=data.likeCount
        })
        .catch(err=>{
            console.error("Error liking post:",err);
            showMessage("You must be logged in to like posts");
        });
    });
            blogContainer.appendChild(postElement);
        });
    }catch(error){
        console.error("Error loading posts:",error);
    }

   

        //Handle Edit Button Click
        document.querySelectorAll(".edit-btn").forEach(button=>{
            button.addEventListener("click",(event)=>{
                const postId=event.target.getAttribute("data-id");
                window.location.href=`edit.html?id=`+encodeURIComponent(postId);//Redirect to edit page with post ID
        });

        const deleteButtons=document.querySelectorAll(".delete-btn")
            deleteButtons.forEach(button=>{
                button.replaceWith(button.cloneNode(true));//Removes existing listeners
            });
        });     
        
        //Handle Delete button Click
        blogContainer.addEventListener("click",async(event)=>{
            if(event.target.classList.contains("delete-btn")){
                    const postElement=event.target.closest(".card");
                    const postId=event.target.getAttribute("data-id");

                    //Ask for confirmarion only once
                    if(!window.confirm("Are you sure you want to delete this post?"))return;

                    try{

                        const response=await fetch(`/posts/${postId}`,{ method:"DELETE"});

                        if(!response.ok){
                            throw new Error("Failed to delete post");
                        }

                        const data=await response.json();
                        showMessage(data.message);//Shows sucess message
                        
                        //Remove the post from the page immediately
                        postElement.remove();

                    }catch(error){
                        console.error("Error deleting post:",error);
                    }
                }
            })
        });
        
document.addEventListener("DOMContentLoaded",()=>{
    const logoutButton=document.getElementById("logout");

    if(logoutButton){
        logoutButton.addEventListener("click",async(event)=>{
            event.preventDefault();//Prevent the default link behaviour

            try{
            const response=await fetch("/logout",{method:"POST"});
            const data=await response.json();
            
            if(response.ok){
                showMessage(data.message);//Show Logout message
                window.location.href="index.html";//Redirect to homepage
            }else{
                showMessage("Error:"+data.message);
            }
            }catch(error){
                console.error("Logout error:",error);
            }
        });
    }
});

document.addEventListener("DOMContentLoaded",()=>{
    const themeToggle=document.getElementById("theme-toggle");
    const body=document.body;

    //Check if user has a saved preferance
    let savedTheme=localStorage.getItem("theme")||"light";//Default to light mode
        body.setAttribute("data-bs-theme",savedTheme);

        if(themeToggle){
        themeToggle.innerText=savedTheme==="dark"?"Light Mode":"Dark Mode";
    

    //Toggle between light and dark mode
    themeToggle.addEventListener("click",()=>{
        const currentTheme=body.getAttribute("data-bs-theme")==="dark"?"light":"dark";
        body.setAttribute("data-bs-theme",currentTheme);
        localStorage.setItem("theme",currentTheme);//Save prefrence
        themeToggle.innerText=currentTheme==="dark"?"Light Mode":"Dark Mode"
    })
    
}
});
