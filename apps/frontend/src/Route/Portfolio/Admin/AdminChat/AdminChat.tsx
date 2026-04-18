/* Extern */
import { useEffect, useState } from "react";


/* Back */


/* Css */
// import './AdminChat.scss'

/* Components */

/* Types */
//interface AdminChatProps {
//    children: ReactNode;
//    className?: string;
//}

export default function AdminChat() {

    const code = 128;
    const content = "oui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le cacaoui oui le caca"

    return (
        <ul className={`AdminChat-root`}>
            <li>
                <p>{"{"}<span className={`${code > 0 ? "error": "default"}`}>{code}</span>{"}"} /Home/user{" ->"}</p>
                <p className={`content`}>{content}</p>
            </li>
            <li>
                <p>{"{"}<span className={`${code > 0 ? "error": "default"}`}>{code}</span>{"}"} /Home/user{" ->"}</p>
                <p className={`content`}>{content}</p>
            </li>
        </ul>
    );
}