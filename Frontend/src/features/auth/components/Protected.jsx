import { useAuth } from "../hooks/useAuth";
import {Navigate } from "react-router-dom";


const Protected = ({children})=>{
    const {loading,user}=useAuth()

    if(loading){
        return <div className="loading-overlay">Loading...</div>;
    }
    if(!user){
      return  <Navigate to="/login" replace/>
    }
    return children;
}
export default Protected