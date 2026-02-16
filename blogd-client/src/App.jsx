import { Routes, Route , useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import api from "./services/api";
import Home from "./components/Home"
import Register from "./pages/Register"
import Login from "./pages/Login";
import NewPost from "./pages/NewPost";
import MyPosts from "./pages/MyPosts";
import EditPost from "./pages/EditPost";
import BlogPage from "./pages/BlogPage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";



function App(){ 
  const {loading,setUser}=useAuth();
  const navigate=useNavigate();
  const [theme,setTheme]=useState(
    localStorage.getItem("theme")||"light"
  );

  useEffect(()=>{
    document.body.setAttribute("data-bs-theme",theme);
    localStorage.setItem("theme",theme);
  },[theme]);

  if (loading) return <p>Loading...</p>;
 
  async function handleLogout(){
    try{
      await api.post("/logout");

      setUser(null);
      navigate("/");
     }catch(err){
      console.error("Logout error:",err);
         }
  }

  return (
   
<div className="d-flex flex-column min-vh-100">

  <Navbar theme={theme} setTheme={setTheme} />

  <div className="container mt-4 flex-grow-1">

      {/*Routes*/}  
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/login" element={<Login/>}/>
        
        <Route 
        path="/new-post" 
        element={
          <ProtectedRoute>
            <NewPost/>
            </ProtectedRoute>
          }
          />

        <Route 
        path="/my-posts" 
        element={
        <ProtectedRoute>
          <MyPosts/>
          </ProtectedRoute>
        }
        />

        <Route 
        path="/edit-post/:id" 
        element={
        <ProtectedRoute>
          <EditPost/>
          </ProtectedRoute>
        }
        />

        <Route path="/post/:id" element={<BlogPage/>}/>
        <Route path="/privacy" element={<PrivacyPolicy/>}/>
        <Route path="/terms" element={<Terms/>}/>
      </Routes>
 </div>

      <Footer/>
     
      </div>
 )
}

export default App;