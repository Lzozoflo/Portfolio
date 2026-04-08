/* Extern */
import { useEffect, useState } from "react";


/* Back */


/* Css */
// import './ExplorateurContextMenu.scss'

/* Components */

/* Types */
interface ExplorateurContextMenuProps {
   infoBulle    :   { x: number, y:number, type: "folder" | "file", pwd : string};
}

export default function ExplorateurContextMenu({ infoBulle }: ExplorateurContextMenuProps) {
    return (
        <div className={`ExplorateurContextMenu-root`} style={{ top: infoBulle.y, left: infoBulle.x, position: 'fixed', zIndex: 1000 }}>
            {infoBulle.type === "folder" && (
                <>
                    <button onClick={() => console.log("New File")}     >New File   </button>
                    <button onClick={() => console.log("New Folder")}   >New Folder </button>
                </>
            )}
            <button onClick={() => console.log("Copier", infoBulle.pwd)}>Copier</button>
            <button onClick={() => console.log("Supprimer", infoBulle.pwd)}>Supprimer</button>
        </div>
    )
}