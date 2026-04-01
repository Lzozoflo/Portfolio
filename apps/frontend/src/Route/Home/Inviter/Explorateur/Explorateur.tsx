/* extern */
import { useState } from "react";

/* Css */
import "./Explorateur.scss";


/* Components */
import ExplorateurItem from "./ExplorateurItem/ExplorateurItem";

/* Types */

import type { FileNode } from '@portfolio/shared';
// export type FileNode = {
//     name: string;
//     type: "file" | "folder";
//     data?: string,
//     children?: FileNode[];
// };

export default function Explorateur({ dir, pwd , displayOnScreen }: { dir: FileNode | undefined , pwd : string, displayOnScreen: (pwd: string) => void ; }) {

    // state pour gérer plusieurs dossiers
    const [openFolders, setOpenFolders] = useState<{ [key: string]: boolean }>({});

    function toggle(id: string) {
        setOpenFolders(prev => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return(
        <ul className="Explorateur-Comp">
            {dir?.children?.map((node: FileNode) => (
                <ExplorateurItem 
                    key={`${pwd}${node.name}`} 
                    pwd={`${pwd}${node.name}`}
                    openFolders={openFolders}
                    toggle={toggle}
                    node={node}
                    depth={1}
                    displayOnScreen={displayOnScreen}
                />
            ))}
        </ul>
    );
}