import {useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import api from "../services/api";

function Login(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    
    const {setUser}=useAuth();
    const navigate = useNavigate();
    const {showSuccess,showError}=useNotification();

    async function handleSubmit(e){
        e.preventDefault();
        
        try{
            const data=await api.post("/login",{
                email,
                password
            });

            if(data?.message==="Login sucessful!"){
                showSuccess("Login sucessful");
                setEmail("");
                setPassword("");
                setUser(data.user);
                navigate("/");
            }else{
                showError(data?.message||"Login failed");
            }
        }
            catch(error){
                console.error("Login error:",error);
                showError("Sever error");
            } 
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{minHeight:"70vh"}}>
            <div className="card shadow p-4" style={{width:"100%",maxWidth:"420px"}}>

            <h3 className="text-center mb-4">Login to your account</h3>
            
            <form onSubmit={handleSubmit}>

                <div className="mb-3">
                    <label className="form-label">Email:</label><br/>
                    <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                    required
                    />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password:</label><br/>
                        <input
                        type="password"
                        className="form-control"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-100">
                        Login
                        </button>

            </form>

            <div className="text-center mt-3">
            <Link to="/register" className="text-decoration-none">
            Create new account
            </Link>
            </div>
            <div className="text-center mt-2">
            <Link to="/" className="text-muted text-decoration-none">
            Back to Home
            </Link>
            </div>
        </div>
        </div>
    );
}

export default Login;