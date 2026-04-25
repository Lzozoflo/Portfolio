/* extern */
import { useEffect, useState, useRef }  from    'react';

/* Css */
import './Admin.scss'

/* Component */
import { useKeyboardStore }             from    'HOOKS/useKeyboardStore';
import AdminChat                        from    './AdminChat/AdminChat';

/* Types */
import type { FileNode, IDBNode }       from    '@portfolio/shared';
import { BrowserRouter } from 'react-router-dom';

type t_crud = {
    test: (path: string) => Promise<boolean>;
    ls: (filePath: string) => Promise<IDBNode | undefined>;
    cat: (filePath: string) => Promise<IDBNode | undefined>;
    mkdir: (parentPath: string, name: string) => Promise<void>;
    touch: (parentPath: string, name: string) => Promise<void>;
    write: (filePath: string, data: string) => Promise<void>;
    rm: (path: string) => Promise<void>;
    resetDatabase: () => Promise<void>;
}

interface AdminProps {
   idbNode: IDBNode[];
   crud:t_crud;
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

const LABEL_HISTORY_SESSION_STORAGE: string = 'cmd_history';
const ALL_CMD_ADD: string = `
help          :  print all command available
pwd           :  Print Working Directory
ls            :  List information about the FILEs 
cd            :  wip
touch         :  wip
mdkir         :  wip
cat           :  wip
echo          :  wip alter echo -h for more information
historyclear  :  delete your current local history cmd
clear         :  delete your chat
`
function resolveManual(pathStr:string) {
    const segments = pathStr.split('/');
    const stack = [];

    for (const seg of segments) {
        if (seg === '..') {
            stack.pop();
        } else if (seg !== '.' && seg !== '') {
            stack.push(seg);
        }
    }
    return `/${stack.join('/')}`;
}


export default function Admin({idbNode, crud}:AdminProps) {
    
    const [isVisibleGif, setIsVisibleGif] = useState(false);
    useEffect(() => {
        if (!isVisibleGif) return;

        const timer = setTimeout(() => {
            setIsVisibleGif(false);
        }, 5000); // Disparaît après 5 secondes

        return () => clearTimeout(timer);
    }, [isVisibleGif]);

    const [terminalState, setTerminalState] = useState<TerminalState>({ 
        history:[],
        index: 0,
        currentCode:0,
        pwd: '/',
        chat: [{code: 0, pwd:"/", cmd: "help", rep:`Available commands: ${ALL_CMD_ADD}`}]
    });

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
        
        setTerminalState(prev => ({
            ...prev,
            index: terminalState.history.length,
        }));
        console.log("terminalState:",terminalState);

        localStorage.setItem(LABEL_HISTORY_SESSION_STORAGE, JSON.stringify(terminalState.history));
    }, [terminalState.history])


    async function handelCmd () {
        let responce = ''
        let statusCode = terminalState.currentCode;
        const cmd = input.value.trim()
        if (cmd === "") {
            setTerminalState(prev => ({
                ...prev,
                chat: [
                    ...prev.chat,
                    {
                        code: statusCode,
                        pwd: terminalState.pwd,
                        cmd: cmd,
                        ...(responce !== '' && { rep: responce })
                    }
                ]
            }));
            setInput(prev => ({ ...prev, value: '' })); // Réinitialise l'input
            return
        }
        const cmdSplit = cmd.split(' ');
        
        // console.log("cmdSplit", cmdSplit);
        
        switch (cmdSplit[0]) {
            case "sossu":
            case "chaussure":{
                setIsVisibleGif(true);
                responce = "Affichage de la chaussure...";
                statusCode = 0;
                break;
            }
            case "help":{
                responce = `Available commands: ${ALL_CMD_ADD}`;
                statusCode = 0;
                break
            }
            case "pwd":{
                if (cmdSplit.length > 1){
                    responce = `pwd: too many arguments`;
                    statusCode = 1;
                    break
                }
                responce = terminalState.pwd;
                statusCode = 0;
                break
            }
            case "ls":{
                if (cmdSplit.length > 2){
                    responce = `ls: too many arguments`;
                    statusCode = 1;
                    break
                }
                const path = `${cmdSplit.length === 2 ? (
                    cmdSplit[1][0] === "/" ? (cmdSplit[1].length === 1 ? 
                        `/`
                        :
                        `/${cmdSplit[1].split('/').filter(p => p !== '.' && p !== '').join('/')}/`
                    )
                    :
                    `${terminalState.pwd}${cmdSplit[1].split('/').filter(p => p !== '.' && p !== '').join('/')}/`
                ) : terminalState.pwd}`;

                const node: IDBNode | undefined = await crud.ls(path);
                const children = node?.childrenPath.map((str) => {

                    if (str[str.length - 1] === '/'){
                        const tmp = str.split('/')
                        return `${tmp[tmp.length - 2]}/ `
                    }
                    return `${str.split('/').pop()} `
                })?.join(' ')
                responce = `${children?? `ls: cannot access '${cmdSplit[1]}': No such file or directory`}`;
                statusCode = children ? 0 : 1;
                break
            }
            case "cd":{

                if (cmdSplit.length > 2){
                    responce = `cd: too many arguments`;
                    statusCode = 1;
                    break
                }
                const path = `${cmdSplit.length === 2 ? (
                    cmdSplit[1][0] === "/" ? (cmdSplit[1].length === 1 ? 
                        `/`
                        :
                        `/${cmdSplit[1].split('/').filter(p => p !== '.' && p !== '').join('/')}/`
                    )
                    :
                    `${terminalState.pwd}${cmdSplit[1].split('/').filter(p => p !== '.' && p !== '').join('/')}/`
                ) : '/'}`;
                console.log("path:",path);
                const finalPath = `${resolveManual(path).length === 1 ? '/' :  `${resolveManual(path)}/`}`;
                console.log("finalPath:",finalPath);

                const existe: boolean = await crud.test(finalPath)
                if (!existe) {
                    responce = `cd: cannot access '${cmdSplit[1]}': No such file or directory`;
                    statusCode = 1;
                    break;
                }
                setTerminalState(prev => ({
                    ...prev,
                    pwd: finalPath
                }));
                responce = `cd: move too ${cmdSplit[1] ?? '/'}`;
                statusCode = 0;
                break
            }
            case "touch":{
                responce = `wip`;
                statusCode = 42;
                break
            }
            case "mdkir":{
                responce = `wip`;
                statusCode = 42;
                break
            }
            case "cat":{
                responce = `wip`;
                statusCode = 42;
                break
            }
            case "echo":{
                responce = ``;
                statusCode = 42;
                break
            }
            case "c":
            case "clear":{
                setTerminalState(prev => ({
                    ...prev,
                    currentCode: 0,
                    chat: []
                }));    
                setInput(prev => ({ ...prev, value: '' })); // Réinitialise l'input
                return
            }
            case "historyclear":{
                localStorage.removeItem(LABEL_HISTORY_SESSION_STORAGE)
                responce = "History cleared.";
                statusCode = 0;
                break;
            }
            default:{
                responce = `command not found: ${cmd}`;
                statusCode = 127;
                break;
            }
        }

        setTerminalState(prev => ({
            ...prev,
            history: [...prev.history, input.value],
            index: terminalState.history.length + 1,
            currentCode: statusCode,
            chat: [
                ...prev.chat, 
                {
                    code: statusCode,
                    pwd: terminalState.pwd,
                    cmd: cmd,
                    ...(responce !== '' && { rep: responce })
                }
            ]
        }));

        setInput(prev => ({ ...prev, value: '' })); // Réinitialise l'input
    }


    function keyPress(type: 'Up'| 'Down', e: React.KeyboardEvent<HTMLDivElement>) {

        function canWeContinue(){
            e.preventDefault();
            return (terminalState.history.length === 0)
        }
        
        function handleKeyDown() {

            switch (e.key) {
                case "Control": {
                    setInput(prev => ({...prev, control: true }));
                    break;
                }
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
                // console.log("voila la touche Down:",e.key)
                default:{break;}
            }
            
        }

        function handleKeyUp() {

            switch (e.key) {
                case "Control": {
                    setInput(prev => ({...prev, control: false }));
                    break;
                }
                default:{break;}
            }
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

                {isVisibleGif && <video src="https://images-ext-1.discordapp.net/external/FA_kKmTzrABI4oY6j6e1Fs7tuD4dbj3qiJroa6t3bFo/https/media.tenor.com/RIs4DDU51W0AAAPo/%25EB%25B0%2598%25EC%258A%25A4-vans.mp4" autoPlay loop></video>}
                <AdminChat terminalState={terminalState}/>
                {isOpen && <p>oui oui chaussure</p>}
                <form className={`input-chat`} onSubmit={(e) => { e.preventDefault(); handelCmd(); }}>

                    <p>{`${terminalState.pwd} ->`}</p>

                    {/* onChange for tabulation auto complet with the onKeyDown*/}
                    <input  ref={inputRef} autoComplete="off"
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
