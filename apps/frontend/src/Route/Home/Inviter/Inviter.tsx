/* extern */
import { useEffect, useState, useCallback } from "react";
import CodeMirror                           from '@uiw/react-codemirror';

/* Css */
import './Inviter.scss'

/* Components */
import { useClock }                         from 'HOOKS/useClock'
import Hr                                   from 'COMP/Hr/Hr'
import Explorateur                          from "./Explorateur/Explorateur";

/* Types */
import type { FileNode, IDBNode }           from '@portfolio/shared';

interface InviterProps { 
    fileSystem: FileNode | undefined,
    crud: any 
}

export default function Inviter({ fileSystem, crud }: InviterProps) {
    const [fileToDisplay, setFileToDisplay] = useState<IDBNode | undefined>(undefined);
    const [content, setContent] = useState<string | null>(null);
    const { time } = useClock();

    async function handelscreen(pwd: string) {
        const resCrudCat = await crud.cat(pwd);
        if (resCrudCat.path === fileToDisplay?.path){
            setFileToDisplay(undefined);
            return;
        }
        setFileToDisplay(resCrudCat);
    }

    useEffect(() => {
        if (fileToDisplay === undefined){
            setContent(null)
            return;
        } 
        setContent(fileToDisplay?.data ?? "");
    }, [fileToDisplay]);


    return (
        <div className={`Inviter-root`}>
            <Hr initial={335} min2={230}>
                <div className={`Explorateur-root`}>
                    {fileSystem && <Explorateur dir={fileSystem} pwd={`/home/user/`} displayOnScreen={handelscreen}/>}
                    {!fileSystem && (
                        <div className={`Explorateur-undefined`}>
                            <p>⚠️ /user/ ⚠️</p>
                            <br />
                            <p>directory /user/ was not defined</p>
                        </div>
                    )}
                    <p style={{ width: "100%", textAlign: "center"}}>{time}</p>
                    <button className={`btc-reset`} onClick={crud.resetDatabase}>reset</button>
                </div>

                <div className={`display`}>
                    <div className={`nav-bar`}>

                    </div>

                    <div className={`display-file`}>
                        {content !== null && (
                            <CodeMirror
                                value={content}
                                height={`100%`}
                                // extensions={extensions}
                                onChange={(value) => {setContent(value); 
                                    // console.log(`value:${value}`);
                                }}
                                className={`codemirror-container`}
                                basicSetup={{
                                    lineNumbers: true,
                                    foldGutter: true,
                                    highlightActiveLine: true,
                                }}
                            />
                        )}
                    </div>
                </div>
            </Hr>
        </div>
    )
}



//   const handleKeyPress = useCallback((event: any) => {
//     console.log(`Key pressed: ${event.key}`);
//   }, []);

//   useEffect(() => {
//     // attach the event listener
//     document.addEventListener('keydown', handleKeyPress);

//     // remove the event listener
//     return () => {
//       document.removeEventListener('keydown', handleKeyPress);
//     };
//   }, [handleKeyPress]);