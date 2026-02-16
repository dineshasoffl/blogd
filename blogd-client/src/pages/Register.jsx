import {useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api"

function Register(){
    const [username,setUsername] = useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    
    const navigate=useNavigate();
    const {showSuccess,showError}=useNotification();

     async function handleSubmit(e){
        e.preventDefault();
        
        try{
            const data=await api.post("/register",{
                username,
                email,
                password
            });

            if(data?.message==="Register sucessful!Please log in."){
                showSuccess("Registration sucessful.Please login");
                navigate("/login");
            }else{
                showError(data?.message||"Registration failed");
            }
        }
            catch(error){
                console.error("Register error:",error);
                showError("Sever error");
            } 
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight:"70vh"}}>
            <div className="card shadow p-4" style={{width:"100%",maxWidth:"420px"}}>

            <h2 className="text-center mb-4">Create your account</h2>
            
            <form onSubmit={handleSubmit}>

                 <div className="mb-3">
                    <label  className="form-label">Username:</label><br/>
                    <input
                    type="text"
                    className="form-control"
                    value={username}
                    onChange={(e)=>setUsername(e.target.value)}
                    required
                    />
                    </div>

                <div className="mb-3">
                    <label  className="form-label">Email:</label><br/>
                    <input
                    type="email"
                     className="form-control"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                    />
                    </div>

                    <div className="mb-3">
                        <label  className="form-label">Password:</label><br/>
                        <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                        />
                    </div>

                    <button type="submit" className="btn btn-sucess w-100">
                        Register
                        </button>

            </form>
 
            <div className="text-center mt-3">
            <Link to="/login" className="text-decoration-none">
            Already have an account?Login
            </Link>
             </div>
             
            <div className="text-center mt-2" >
             <Link to="/" className="text-muted text-decoration-none">
             Back to Home
             </Link>
             </div>
        </div>
        </div>
    );
}

export default Register;