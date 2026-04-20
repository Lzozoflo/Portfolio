/* Extern */
import { useEffect, useState } from "react";


/* Back */


/* Css */
// import './AdminMessage.scss'

/* Components */

/* Types */
import { terminalChat } from "../Admin";

//interface AdminMessageProps {
//    children: ReactNode;
//    className?: string;
//}

export default function AdminMessage({code, pwd, cmd, rep}: terminalChat) {
    return (
        <li className={`AdminMessage-root`}>
            <p>{`{`}<span className={`${code > 0 ? "error": "default"}`}>{code}</span>{`}${pwd} -> ${cmd}`}</p>
            {rep && <p className={`${code > 0 ? "error": "default"}`}>{rep}</p>}
        </li>
    )
}