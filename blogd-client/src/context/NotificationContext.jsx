import { createContext,useContext,useState } from "react";

const NotificationContext=createContext();

export function NotificationProvider({children}){
    const [message,setMessage]=useState(null);
    const [type,setType]=useState("sucess");

    function showSuccess(msg){
        setType("success");
        setMessage(msg);
        setTimeout(()=>setMessage(null),4000);
    }

    function showError(msg){
        setType("danger");
        setMessage(msg);
        setTimeout(()=>setMessage(null),4000);
    }

    return (
        <NotificationContext.Provider value={{showSuccess,showError}}>
            {message && (
                <div
                className={`alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3 shadow`}
                style={{zIndex:9999,minWidth:"300px"}}
                >
                    {message}
                </div>
            )}
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotification=()=>useContext(NotificationContext);