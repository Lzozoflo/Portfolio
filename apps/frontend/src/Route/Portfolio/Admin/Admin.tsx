/* extern */
import { useEffect, useState, useRef }  from    'react';

/* Css */
import './Admin.scss'

/* Component */
import { useKeyboardStore }                 from    'HOOKS/useKeyboardStore';
import AdminChat                        from    './AdminChat/AdminChat';

/* Types */
import type { FileNode, IDBNode }       from    '@portfolio/shared';
interface AdminProps {
   idbNode: IDBNode[];
}
export type terminalChat = {
    code: number;
    pwd: string;
    cmd: string;
    rep?: string;
}
export type TerminalState = {
    history:        string[];
    index:          number;
    currentCode:    number;
    pwd:            string;
    chat:           terminalChat[];
}

export type InputValue = {
    value:          string;
    control:        boolean;
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

    const [terminalState, setTerminalState] = useState<TerminalState>({ history:[], index: 0, currentCode:0, pwd: '/home/', chat: [{code: 0, pwd:"/home/", cmd: "test"},{code: 1, pwd:"/home/", cmd: "test", rep:"chaussure"}]});
    const [input, setInput] = useState<InputValue>({value: "", control: false});
    const isOpen   = useKeyboardStore((state) => state.isOpen);
    const inputRef = useRef<HTMLInputElement>(null);

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
        if (input.value === "") return

        console.log("input.value:",input.value);
        
        switch (input.value) {
            case "clearhistory":{
                localStorage.removeItem(LABEL_HISTORY_SESSION_STORAGE)
                break;
            }
            case "help":{

                break
            }
            default:
                break;
        }

        setTerminalState(prev => ({
            ...prev,
            history: [...prev.history, input.value],
            index: terminalState.history.length + 1,
            chat: [
                ...prev.chat, 
                {
                    code: terminalState.currentCode,// code rep 
                    pwd: terminalState.pwd,
                    cmd: input.value
                    // rep est optionnel selon votre type
                }
            ]
        }));

        setInput(prev => ({
            ...prev,
            value: ''
        })); // Réinitialise l'input
    }


    function keyPress(type: 'Up'| 'Down', e: React.KeyboardEvent<HTMLDivElement>) {

        function canWeContinue(){
            e.preventDefault();
            return (terminalState.history.length === 0)
        }
        
        function toggelKey() : boolean{
            switch (e.key) {
                case "Control": {
                    console.log("ouais j'ai control:", !input.control);

                    setInput(prev => ({
                        ...prev,
                        control: !prev.control
                    }));
                    break;
                }
                default:{
                    break;
                }
            }
            return false
        }

        function handleKeyDown() {

            toggelKey();

            switch (e.key) {
                case "ArrowUp":{
                    if (canWeContinue()) return;
                    newIndex = Math.max(0, terminalState.index - 1);
                    break;
                }
                case "ArrowDown":{
                    if (canWeContinue()) return;
                    
                    newIndex = Math.min(terminalState.history.length, terminalState.index + 1);
                    break;
                }
                case "Tab": {
                    if (canWeContinue()) return;
                    
                    console.log("ouais j'ai taber");
                    break;
                }
                case "C": case "c": {
                    if (input.control !== true) return;

                    console.log("Ctrl + C");
                    setTerminalState(prev => ({
                        ...prev,
                        currentCode: 130,
                        chat: [
                            ...prev.chat, 
                            {
                                code: 130,
                                pwd: terminalState.pwd,
                                cmd: input.value
                                // rep est optionnel
                            }
                        ]
                    }));

                    setInput(prev => ({
                        ...prev,
                        value: ''
                    }));

                    break;
                }
                default:{
                    
                    console.log("voila la touche Down:",e.key);
                    break;
                }
            }
            
        }

        function handleKeyUp() {
            toggelKey();
        }

        let newIndex = terminalState.index;

        if (type === 'Down'){
            handleKeyDown();
        }else{
            handleKeyUp();
        }

        if (newIndex !== terminalState.index) {
            setTerminalState(prev => ({ ...prev, index: newIndex }));
            setInput(prev => ({
                ...prev,
                value: terminalState.history[newIndex] || ""
            }))
        }
    }
        
    return (
        <div className={`Admin-root`} 
            onKeyDown={(e) => { keyPress('Down', e) } }
            onKeyUp={(e) => { keyPress('Up', e) } }
            onClick={() => (inputRef?.current?.focus())}
            >
            <div>

                <AdminChat terminalState={terminalState}/>

                {isOpen && <p>oui oui chaussure</p>}
                <form className={`input-chat`} onSubmit={(e) => { e.preventDefault(); handelCmd(); }}>

                    <p>{`{`}<span className={`${terminalState.currentCode > 0 ? "error": ""}`}>{terminalState.currentCode}</span>{`}${terminalState.pwd} ->`}</p>

                    {/* onChange for tabulation auto complet with the onKeyDown*/}
                    <input  ref={inputRef}
                            id={`CMDInput`} type={`text`}  value={input.value}
                            onChange={(e) => {  setInput(prev => ({
                                ...prev,
                                value: e.target.value
                            }));
                            setTerminalState(prev => ({...prev,index: terminalState.history.length})); } }
                        />
                    <button type={`submit`}>{">"}</button>

                </form>

            </div>
        </div>
    )
}
