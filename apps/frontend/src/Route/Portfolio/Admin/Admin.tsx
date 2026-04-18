/* extern */
import { useEffect, useState } from "react";

/* Css */
import './Admin.scss'

/* Component */
import AdminChat from "./AdminChat/AdminChat";

/* Types */
//interface AdminProps {
//    children: ReactNode;
//    className?: string;
//}


export default function Admin() {

    

    return (
        <div className={`Admin-root`}>
            <AdminChat/>


            <div className={`input-chat`}> 
                <input type={`text`}/><button>{">"}</button>
            </div>
        </div>
    )
}
