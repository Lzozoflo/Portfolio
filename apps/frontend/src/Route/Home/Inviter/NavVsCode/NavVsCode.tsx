/* extern */
import { useEffect, useState } from "react";

/* Css */
// import 'NavVsCode.scss'

/* Components */

/* Types */
import type { IDBNode }           from '@portfolio/shared';

interface NavVsCodeProps {
    eraseByPath: (path: string) => void;
    allSelectFile: IDBNode[] | undefined;
}

export default function NavVsCode({ eraseByPath, allSelectFile }: NavVsCodeProps) {

    return (
        <div className={`NavVsCode-root`}>
            {allSelectFile?.map((file: IDBNode) => {
                return (
                    <button onClick={() => eraseByPath(file.path)}>{file.name}</button>
                )
            }) || <div>chaussure</div> }
        </div>
    )
}