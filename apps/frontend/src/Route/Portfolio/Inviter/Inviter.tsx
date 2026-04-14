/* extern */
import { useEffect, useState, useCallback } from "react";
import CodeMirror                           from '@uiw/react-codemirror';

/* Css */
import './Inviter.scss'

/* Components */
import { useClock }                         from 'HOOKS/useClock'
import Hr                                   from 'COMP/Hr/Hr'
import Explorateur                          from "./Explorateur/Explorateur";
import NavVsCode                            from "./NavVsCode/NavVsCode";

/* Types */
import type { FileNode, IDBNode }           from '@portfolio/shared';

interface InviterProps { 
    fileSystem: FileNode | undefined,
    crud: {
        ls: (folderPath: string) => Promise<IDBNode[]>;
        cat: (filePath: string) => Promise<IDBNode | undefined>;
        mkdir: (parentPath: string, name: string) => Promise<void>;
        touch: (parentPath: string, name: string) => Promise<void>;
        write: (filePath: string, data: string) => Promise<void>;
        rm: (path: string) => Promise<void>;
        resetDatabase: () => Promise<void>;
    }
}

export default function Inviter({ fileSystem, crud }: InviterProps) {
    const { time } = useClock();

    const [allSelectFile, setAllSelectFile] = useState<IDBNode[] | undefined>(undefined);
    const [displayContent, setDisplayContent] = useState<string | null>(null);

    async function handelScreen(pwd: string) {
        // console.log("pwd ",pwd)

        const resCrudCat: IDBNode | undefined = await crud.cat(pwd);

        setAllSelectFile(prev => {
            const list = prev ?? [];

            if (!resCrudCat) return list;

            const alreadyExists = list.some(f => f.path === resCrudCat.path);

            if (alreadyExists) {
                return list;
            }

            return [...list, resCrudCat];
        });

        setDisplayContent(resCrudCat?.data ?? "");
    }

    function eraseByPath(path: string) {
        // console.log("allSelectFile before",allSelectFile);
        
        setAllSelectFile(prev =>
            prev?.filter(file => file.path !== path)
        );
        
        // console.log("allSelectFile after ",allSelectFile);
    }

    return (
        <div className={`Inviter-root`}>
            <Hr initial={335} min2={230}>

                <div className={`Explorateur-root`}>
                    {fileSystem && <Explorateur dir={fileSystem} pwd={`/home/user/`} displayOnScreen={handelScreen}/>}
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

                    <NavVsCode eraseByPath={eraseByPath} allSelectFile={allSelectFile}/>
                    
                    <hr />

                    <div className={`display-file`}>
                        {displayContent !== null && (
                            <CodeMirror
                                value={displayContent}
                                height={`100%`}
                                // extensions={extensions}
                                onChange={(value : string) => {setDisplayContent(value); 
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