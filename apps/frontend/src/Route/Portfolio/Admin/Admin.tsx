/* extern */
import { useEffect, useState } from "react";

/* Css */
import './Admin.scss'

/* Component */
import AdminChat from "./AdminChat/AdminChat";

/* Types */
import type { FileNode, IDBNode }           from    '@portfolio/shared';
interface AdminProps {
   idbNode: IDBNode[];
}
type TerminalState = {
    history: string[];
    index: number;
    currentCode: number;
}
    // // ── ls ───────────────────────────────────────────────────────────────────
    // //
    // // Liste les enfants DIRECTS d'un dossier.
    // //
    // // Exemple :
    // //   const items = await ls('/user/');
    // //   // → [{ path: '/user/ReadMe.md', name: 'ReadMe.md', type: 'file', ... }, ...]
    // const ls: (folderPath: string) => Promise<IDBNode[]> = useCallback(
    //     async (folderPath: string): Promise<IDBNode[]> => {
    //         if (!db) return [];
    //         return getByParent(db, folderPath);
    //     },
    //     [db]
    // );

const LABEL_HISTORY_SESSION_STORAGE: string = 'cmd_history';

export default function Admin({idbNode}:AdminProps) {

    const [terminalState, setTerminalState] = useState<TerminalState>({ history:[], index: 0, currentCode:0 });
    const [inputValue, setInputValue] = useState<string>("");

    useEffect(() => {
        if (terminalState.history.length !== 0) return
        console.log("Admin pannel idbNode:",idbNode);

        const item = localStorage.getItem(LABEL_HISTORY_SESSION_STORAGE)
        setTerminalState(prev => ({
            ...prev,
            history: JSON.parse(item || '[]')
        }));

    }, [])
    
    useEffect(() => {

        if (terminalState.history.length === 0) return
        console.log("terminalState:",terminalState);

        localStorage.setItem(LABEL_HISTORY_SESSION_STORAGE, JSON.stringify(terminalState.history));
    }, [terminalState.history])


    function handelCmd () {
        if (inputValue === "") return

        console.log("inputValue:",inputValue);
        

        switch (inputValue) {
            case "clearhistory":
                localStorage.removeItem(LABEL_HISTORY_SESSION_STORAGE)
                break;
        
            default:
                break;
        }

        setTerminalState(prev => ({
            ...prev,
            history: [...prev.history, inputValue],
            index: terminalState.history.length + 1,
        }));

        setInputValue(""); // Réinitialise l'input
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (terminalState.history.length === 0) return;

        let newIndex = terminalState.index;

        switch (e.key) {
            case "ArrowUp":{
                e.preventDefault();
                // On remonte dans le temps (vers l'index 0 si le plus ancien est à 0)
                newIndex = Math.max(0, terminalState.index - 1);
                break;
            }
            case "ArrowDown":{
                e.preventDefault();
                newIndex = Math.min(terminalState.history.length, terminalState.index + 1);
                break;
            }
            default:
                break;
        }

        if (newIndex !== terminalState.index) {
            setTerminalState(prev => ({ ...prev, index: newIndex }));
            setInputValue(terminalState.history[newIndex] || "");
        }
    }

    return (
        <div className={`Admin-root`}>
            <AdminChat code={terminalState.currentCode}/>







            <form className={`input-chat`} onSubmit={(e) => { e.preventDefault(); handelCmd(); }}>
                {/* onChange for tabulation auto complet */}
                <input  id={`CMDInput`} type={`text`}  value={inputValue} 
                        onKeyDown={(e) => { handleKeyDown(e) } }
                        onChange={(e) => { setInputValue(e.target.value); setTerminalState(prev => ({...prev,index: terminalState.history.length})); } }
                    />
                <button type={`submit`}>{">"}</button>
            </form>
        </div>
    )
}
