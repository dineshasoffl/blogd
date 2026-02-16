import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext=createContext();

export function AuthProvider({ children }){
    const [user,setUser]=useState(null);
    const [loading, setLoading]=useState(true);

    //Check if user is already loggged in (session exists)
    useEffect(()=>{
        async function fetchUser(){
            try{
                const data=await api.get("/me");

                if(data?.unauthorized){
                    setUser(null);
                    setLoading(false);
                    return;
                }

                    setUser(data.user);
                    setLoading(false);

            }catch(err){
                    console.error("Auth check failed:",err);
                }
            }

            fetchUser();
        },[]);
     return  (
        <AuthContext.Provider value={{user,setUser,loading}}>
            {children}
        </AuthContext.Provider>
     );
    }
     //Custom hook(clean & reusable)
     export function useAuth(){
        return useContext(AuthContext);
     }
    