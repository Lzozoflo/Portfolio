/* extern */
import { useEffect, useState, useMemo } from "react";
import CodeMirror from '@uiw/react-codemirror';
// import { javascript } from '@codemirror/lang-javascript';
// import { markdown } from '@codemirror/lang-markdown';
// import { oneDark } from '@codemirror/theme-one-dark';

/* Css */
import './Inviter.scss'

/* Components */
import Hr from 'COMP/Hr/Hr'
import Explorateur from "./Explorateur/Explorateur";

/* Types */
import type { FileNode, IDBNode } from '@portfolio/shared';

interface InviterProps { 
    fileSystem: FileNode | undefined,
    crud: any 
}

export default function Inviter({ fileSystem, crud }: InviterProps) {
    const [fileToDisplay, setFileToDisplay] = useState<IDBNode | undefined>(undefined);
    const [content, setContent] = useState<string | null>(null);

    async function handelscreen(pwd: string) {
        const resCrudCat = await crud.cat(pwd);
        console.log("resCrudCat:",resCrudCat,"fileToDisplay:",fileToDisplay);
        
        if (resCrudCat.path === fileToDisplay?.path){
            console.log("test");
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
                    <button className={`btc-reset`} onClick={crud.resetDatabase}>reset</button>
                </div>

                <div className={`display`}>
                    <div className={`nav-bar`}>

                    </div>

                    <div className={`display-file`}>
                        {content !== null && (
                            <CodeMirror
                                value={content}
                                height="100%"
                                // extensions={extensions}
                                onChange={(value) => {setContent(value); console.log(`value:${value}`);}}
                                className="codemirror-container"
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