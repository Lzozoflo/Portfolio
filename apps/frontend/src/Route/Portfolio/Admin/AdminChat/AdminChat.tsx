/* Extern */
import { useEffect, useState } from "react";

/* Css */
import './AdminChat.scss'

/* Components */
import AdminMessage from "./AdminMessage/AdminMessage";

/* Types */
import { TerminalState, terminalChat } from "../Admin";

interface AdminChatProps {
   terminalState: TerminalState;
}

export default function AdminChat({terminalState}: AdminChatProps) {
    return (
        <ul className={`AdminChat-root`}>
            {terminalState.chat.slice().reverse().map((msg: terminalChat, index)=> {
                return (
                    <AdminMessage key={index} code={msg.code} pwd={msg.pwd} cmd={msg.cmd} rep={msg.rep} />
                )
            })}
        </ul>
    );
}