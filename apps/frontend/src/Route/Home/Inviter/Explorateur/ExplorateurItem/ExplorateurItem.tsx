/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */
// import './ExplorateurItem.scss'

/* Components */

/* Interface */
import { FileNode } from "FRONT/Route/Home/Home";

interface ExplorateurItemProps {
    node: FileNode | undefined;
    pwd : string;
    toggle: (id: string)=> void ;
    openFolders: { [key: string]: boolean };
}

export default function ExplorateurItem({ node, pwd, toggle, openFolders }: ExplorateurItemProps) {
    
    return (
        <li>
            {node ? ( node?.type === "folder" ? (
                    <>
                        <span onClick={() => toggle(`${pwd}${node.name}`)} style={{ cursor: "pointer" }}>
                            {openFolders[`${pwd}${node.name}`] ? "📂" : "📁"} {node.name}
                        </span>
                        {openFolders[`${pwd}${node.name}`] && (
                            <ul>
                                {node?.children?.map((nodechildren) => (
                                    <ExplorateurItem 
                                    key={`${pwd}${nodechildren.name}`} 
                                    pwd={`${pwd}${nodechildren.name}`}
                                    openFolders={openFolders}
                                    toggle={toggle}
                                    node={nodechildren}
                                    />
                                ))}
                            </ul>
                        )}
                    </>

                ) : (

                    <span>📄 {node.name}</span>
                )) : (
                    <span>wtf c'est pas normal si y'a ce display</span> 
                )
            }
        </li>
    )
}