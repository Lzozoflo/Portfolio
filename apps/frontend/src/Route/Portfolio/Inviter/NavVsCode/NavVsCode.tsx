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
                    <li key={index} className={`one-file border-1`} onClick={() => handelScreen(file.file.path)} >
                        <span className="file-name">{file.file.name}</span>
                        <button className="close-btn" onClick={() => eraseByPath(file.file.path)}>X</button>
                    </li>
                )
            })}


        </ul>
    );
}