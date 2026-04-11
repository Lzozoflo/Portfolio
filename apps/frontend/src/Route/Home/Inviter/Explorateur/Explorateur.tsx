/* extern */
import { useState, useEffect }  from "react";

/* Css */
import "./Explorateur.scss";

/* Components */
import ExplorateurItem          from "./ExplorateurItem/ExplorateurItem";
import ExplorateurContextMenu   from "./ExplorateurContextMenu/ExplorateurContextMenu";

/* Types */
import type { FileNode }        from '@portfolio/shared';
// export type FileNode = {
//     name: string;
//     type: "file" | "folder";
//     data?: string,
//     children?: FileNode[];
// };
interface ExplorateurProps {
    dir: FileNode | undefined;
    pwd : string;
    displayOnScreen: (pwd: string) => void; 
}


export default function Explorateur({ dir, pwd , displayOnScreen }: ExplorateurProps) {

    const [statusOpenFolders, setStatusOpenFolders] = useState<{ [key: string]: boolean }>({});

    function toggle(id: string) {
        setStatusOpenFolders(prev => ({...prev,
            [id]: !prev[id],
        }));
    };

    const [infoBulle, setInfoBulle] = useState<{ x: number, y:number, type: "folder" | "file", pwd : string } | null>(null);

    function handleContextMenu(event : React.MouseEvent<HTMLDivElement>, pwd : string, type: "folder" | "file"){
        event.preventDefault();
        event.stopPropagation();
        console.log("event.currentTarget:",event.currentTarget);
        console.log("pwd:",pwd);
        setInfoBulle({ x:event.clientX, y:event.clientY, type , pwd })
        
    }    
    
    useEffect(() => {
        const closeMenu = () => setInfoBulle(null);
        window.addEventListener('click', closeMenu);
        return () => window.removeEventListener('click', closeMenu);
    }, []);



    return(
        <>
            <ul className={`Explorateur-Comp`}>
                {dir?.children?.map((node: FileNode) => (
                    <ExplorateurItem 
                    key={`${pwd}${node.name}`} 
                    statusOpenFolders={statusOpenFolders}
                    node={node}
                    pwd={`${pwd}${node.name}`}
                    depth={1}
                    toggle={toggle}
                    displayOnScreen={displayOnScreen}
                    handleContextMenu={handleContextMenu}
                    
                    />
                ))}
            </ul> 
            {/* Menu Contextuel (Infobulle) */}
            {infoBulle && <ExplorateurContextMenu infoBulle={infoBulle}/> }
            {/* (
                <div className="Explorateur-context-menu" style={{ top: infoBulle.y, left: infoBulle.x, position: 'fixed', zIndex: 1000 }}>
                    <button onClick={() => console.log("Copier", pwd)}>Copier</button>
                    <button onClick={() => console.log("Supprimer", pwd)}>Supprimer</button>
                    {infoBulle?.type && (
                        <>
                            <button onClick={() => console.log("Nouveau Fichier")}>+ Fichier</button>
                            <button onClick={() => console.log("Nouveau Dossier")}>+ Dossier</button>
                        </>
                    )}
                </div>
            )} */}
        </>
    );
}