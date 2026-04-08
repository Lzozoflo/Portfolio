/* Css */
import './ExplorateurItem.scss'

/* Types */
import type { FileNode } from '@portfolio/shared';

interface ExplorateurItemProps {
    statusOpenFolders: { [key: string]: boolean };
    node: FileNode | undefined;

    pwd: string;    // path total du dir ou file
    depth: number;  // profondeur de recursive

    toggle: (id: string) => void ;
    displayOnScreen: (pwd: string) => void ;
    handleContextMenu: (event : React.MouseEvent<HTMLDivElement>, pwd : string, type: "folder" | "file") => void;
}

export default function ExplorateurItem({ statusOpenFolders, node, pwd, depth, toggle, displayOnScreen, handleContextMenu }: ExplorateurItemProps) {

    if (!node ) return
    return (
        <li className={`ExplorateurItem-comp`} >
            {node?.type === "folder" ? (
                <>
                    <div onClick={() => toggle(`${pwd}${node.name}`)} style={{ paddingLeft: `${depth * 10}px`,  cursor: "pointer" }}
                        onContextMenu={(e) => {handleContextMenu(e, `${pwd}${node.name}`, node?.type)}}>
                        <span>{statusOpenFolders[`${pwd}${node.name}`] ? "📂" : "📁"} {node.name}</span>
                    </div>
                    {statusOpenFolders[`${pwd}${node.name}`] && (
                        <ul>
                            {node?.children?.map((nodechildren: FileNode) => (
                                <ExplorateurItem 
                                    key={`${pwd}${nodechildren.name}`} 
                                    statusOpenFolders={statusOpenFolders}
                                    node={nodechildren}
                                    pwd={`${pwd}${nodechildren.name}`}
                                    depth={depth + 1}
                                    toggle={toggle}
                                    displayOnScreen={displayOnScreen}
                                    handleContextMenu={handleContextMenu}
                                />
                            ))}
                        </ul>
                    )}
                </>

            ) : (
                <div style={{ paddingLeft: `${depth * 10}px`, cursor: "pointer" }} 
                    onClick={() => {displayOnScreen(`${pwd}`)}}
                    onContextMenu={(e) => {handleContextMenu(e, `${pwd}`, node?.type)}}>
                    <span >📄 {node.name}</span>
                </div>
            )}
        </li>
    )
}


