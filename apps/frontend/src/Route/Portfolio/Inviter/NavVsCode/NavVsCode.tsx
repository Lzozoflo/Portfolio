/* extern */
import { useEffect, useState }      from "react";

/* Css */
import './NavVsCode.scss'

/* Components */

/* Types */
import type { focusIDBNode }             from '@portfolio/shared';

interface NavVsCodeProps {
    eraseByPath: (path: string) => void;
    handelScreen: (path: string) => void;
    allSelectFile: focusIDBNode[] | undefined;
}

export default function NavVsCode({ eraseByPath, allSelectFile, handelScreen }: NavVsCodeProps) {
    return (
        <ul className={`NavVsCode-root`}>

            {allSelectFile?.map((file: focusIDBNode, index:number) => {
                return (
                    <li key={index} className={`one-file ${file.focus ? 'is-active' : ''}`}
                        // onContextMenu={(e) => e.preventDefault()}
                        onMouseDown={(e) => {
                            switch (e.button) {
                                case 0:{
                                    console.log(`Left click`);
                                    handelScreen(file.file.path);
                                    break;
                                }
                                case 1:{
                                    console.log(`Center click`);
                                    eraseByPath(file.file.path);
                                    break;
                                }
                                case 2:{
                                    console.log(`Right click`);
                                    break;
                                }
                            }
                        }}>
                        <p>
                            <span className={`file-name`}>{file.file.name}</span>{" "}
                            <button className={`close-btn`} onClick={() => eraseByPath(file.file.path)}>X</button>
                        </p>
                    </li>
                )
            })}
        </ul>
    );
}