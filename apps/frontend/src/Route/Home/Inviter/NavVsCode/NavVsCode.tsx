/* extern */
import { useEffect, useState } from "react";

/* Css */
import './NavVsCode.scss'

/* Components */

/* Types */
import type { IDBNode }           from '@portfolio/shared';

interface NavVsCodeProps {
    eraseByPath: (path: string) => void;
    handelScreen: (path: string) => void;
    allSelectFile: IDBNode[] | undefined;
}

export default function NavVsCode({ eraseByPath, allSelectFile, handelScreen }: NavVsCodeProps) {

    // function qui regarder si il y a des doublon dans allSelectFile et cho

    return (
        <ul className={`NavVsCode-root`}>

            {allSelectFile?.map((file: IDBNode, index:number) => {
                return (
                    <li key={index} className="one-file border-1" onClick={() => handelScreen(file.path)}>
                        <span className="file-name">{file.name}</span>
                        <button className="close-btn" onClick={() => eraseByPath(file.path)}>X</button>
                    </li>
                )
            })}


        </ul>
    )
}