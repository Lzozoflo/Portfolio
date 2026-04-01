/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */
import './ExplorateurItem.scss'

/* Components */

/* Types */
import { FileNode } from "FRONT/Route/Home/Home";

interface ExplorateurItemProps {
    openFolders: { [key: string]: boolean };
    displayOnScreen: (pwd: string) => void ;
    toggle: (id: string) => void ;
    node: FileNode | undefined;
    pwd: string;
    depth: number;
}

export default function ExplorateurItem({ openFolders , toggle, node, pwd, depth, displayOnScreen }: ExplorateurItemProps) {
    
    return (
        <li className={`ExplorateurItem-comp`} >
            {node ? ( node?.type === "folder" ? (
                <>
                    <div onClick={() => toggle(`${pwd}${node.name}`)} style={{ paddingLeft: `${depth * 10}px`,  cursor: "pointer"  }}>
                        <span>{openFolders[`${pwd}${node.name}`] ? "📂" : "📁"} {node.name}</span>
                    </div>
                    {openFolders[`${pwd}${node.name}`] && (
                        <ul>
                            {node?.children?.map((nodechildren: FileNode) => (
                                <ExplorateurItem 
                                    key={`${pwd}${nodechildren.name}`} 
                                    pwd={`${pwd}${nodechildren.name}`}
                                    openFolders={openFolders}
                                    node={nodechildren}
                                    depth={depth + 1}
                                    toggle={toggle}
                                    displayOnScreen={displayOnScreen}
                                />
                            ))}
                        </ul>
                    )}
                </>

            ) : (
                <div style={{ paddingLeft: `${depth * 10}px` }} onClick={() => {displayOnScreen(`${pwd}`)}}>
                    <span>📄 {node.name}</span>
                </div>
            )) : (
                <span>wtf c'est pas normal si y'a ce display</span> 
            )}
        </li>
    )
}