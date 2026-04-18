/* extern */
import { useEffect, useState, useReducer }  from    'react';
import CodeMirror                           from    '@uiw/react-codemirror';

/* Css */
import './Inviter.scss'

/* Components */
import fileReducer                          from    'FRONT/lib/AllselectFileReducer'
import { useClock }                         from    'HOOKS/useClock'
import Hr                                   from    'COMP/Hr/Hr'
import Explorateur                          from    './Explorateur/Explorateur';
import NavVsCode                            from    './NavVsCode/NavVsCode';

/* Types */
import type { FileNode, focusIDBNode, IDBNode }           from    '@portfolio/shared';


interface InviterProps {
    fileSystem: FileNode | undefined,
    crud: {
        ls:             (folderPath: string)                => Promise<IDBNode[]>;
        cat:            (filePath: string)                  => Promise<IDBNode | undefined>;
        mkdir:          (parentPath: string, name: string)  => Promise<void>;
        touch:          (parentPath: string, name: string)  => Promise<void>;
        write:          (filePath: string, data: string)    => Promise<void>;
        rm:             (path: string)                      => Promise<void>;
        resetDatabase:  ()                                  => Promise<void>;
    }
}

export default function Inviter({ fileSystem, crud }: InviterProps) {
    const { time } = useClock();


    const [state, dispatch] = useReducer(fileReducer, undefined);
    // const [allSelectFile, setAllSelectFile] = useState<IDBNode[] | undefined>(undefined);
    // const [displayContent, setDisplayContent] = useState<IDBNode | undefined>(undefined);

    async function handelScreen(path: string) {

        const alreadyExists:focusIDBNode | undefined = state?.files?.find(f => f.file.path === path);
        if (alreadyExists){
            const data = alreadyExists.file.data;
            if (data)
                crud.write(path, data)
            
            dispatch({type: 'NEWFOCUS', path})
            return;
        }
            
        const resCrudCat: IDBNode | undefined = await crud.cat(path);

        dispatch({type: 'OPEN', file: resCrudCat })
    }

    function eraseByPath(path: string) {
        const alreadyExists:focusIDBNode | undefined = state?.files?.find(f => f.file.path === path);
        if (alreadyExists){
            const data = alreadyExists.file.data;
            if (data)
                crud.write(path, data)
        }
        dispatch({type: 'CLOSE', path })
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

                    <NavVsCode eraseByPath={eraseByPath} allSelectFile={state?.files} handelScreen={handelScreen}/>
                    
                    <hr />

                    <div className={`display-file`}>

                        {state?.current !== undefined && (
                            <CodeMirror
                                value={state?.current?.data ?? ""}
                                height={`100%`}
                                // extensions={extensions}
                                onChange={(value : string) => {
                                    dispatch({type: 'UPDATE', data: value})
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