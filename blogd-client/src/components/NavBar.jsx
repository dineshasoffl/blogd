import {Link,useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import api from "../services/api";

function NavBar({theme,setTheme}){
    const {user,setUser}=useAuth();
    const navigate=useNavigate();

  async function handleLogout(){
    try{
      await api.post("/logout");

      setUser(null);
      navigate("/");
     }catch(err){
      console.error("Logout error:",err);
         }
  }

  return(
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div  className="container">

                  {/*Brand*/}
                    <Link className="navbar-brand" to="/">BlogD</Link>

                  {/*Mobile toggle*/}
                  <button
                  className="navbar-toggler"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target="#navbarNav"
                  >
                    <span className="navbar-toggler-icon"></span>
                  </button>

                  {/*Links*/}
              <div className="collapse navbar-collapse" id="navbarNav">
                    
                     {/*LEFT SIDE*/}
                     <ul className="navbar-nav me-auto">
                      <li className="nav-item">
                        <Link className="nav-link" to="/">Home</Link>
                      </li>
                    
                    {user&&(
                        <>
                        <li className="nav-item">
                        <Link className="nav-link" to="/my-posts">My posts</Link>
                        </li>
                        <li className="nav-item">
                        <Link  className="nav-link" to="/new-post">New post</Link>
                        </li>
                        </>
                    )} 
                    </ul>

                  {/*RIGHT SIDE*/}
                  <ul className="navbar-nav ms-auto">
                  {!user?(
                    <>
                    <li className="nav-item">
                    <Link  className="nav-link" to="/login">Login</Link>
                    </li>
                    <li className="nav-item">
                    <Link className="btn btn-primary ms-2" to="/register">
                    Register
                    </Link>
                    </li>
                    </>
                  ):(
                        <>
                        <li className="nav-item">
                        <span className="navbar-text me-3">
                          Hi,{user.username}
                          </span>
                        </li>
                        <li className="nav-item">
                        <button 
                        className="btn btn-outline-light" 
                        onClick={handleLogout}
                        >
                          Logout
                          </button>
                        </li>
                        </>
                  )}
                  </ul>
                  <button 
                  className="btn btn-sm btn-outline-light ms-3"
                  onClick={()=>setTheme(theme==="light"?"dark":"light")}
                  >
                    {theme==="light"?"🌙Dark":"☀️Light"}
                  </button>
                  </div>
                  </div>
            </nav>
  );
}

export default NavBar;