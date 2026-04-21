/* Extern */
import { useEffect, useState } from "react";

/* Css */
import './AdminChat.scss'

/* Components */
import AdminMessage from "./AdminMessage/AdminMessage";

/* Types */
import { TerminalState } from "../Admin";

interface AdminChatProps {
   terminalState: TerminalState;
}

export default function AdminChat({terminalState}: AdminChatProps) {
    return (
        <ul className={`AdminChat-root`}>
            {terminalState.chat.map((msg)=> {
                return (
                    <AdminMessage code={msg.code} pwd={msg.pwd} cmd={msg.cmd} rep={msg.rep} />
                )
            })}
        </ul>
    );
}