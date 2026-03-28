/* extern */
import { useState } from "react";

/* Css */
import "./Explorateur.scss";


/* Components */
import ExplorateurItem from "./ExplorateurItem/ExplorateurItem";

/* Interface */
import { FileNode } from "FRONT/Route/Home/Home";
// export type FileNode = {
//     name: string;
//     type: "file" | "folder";
//     data?: string,
//     children?: FileNode[];
// };

export default function Explorateur({ dir, pwd }: { dir: FileNode | undefined , pwd : string}) {

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
            {dir?.children?.map((node) => (
                <ExplorateurItem 
                    key={`${pwd}${node.name}`} 
                    pwd={`${pwd}${node.name}`}
                    openFolders={openFolders}
                    toggle={toggle}
                    node={node}
                />
            ))}
        </ul>
    );

}


// <li key={`${pwd}${node.name}`}>
//     {node.type === "folder" ? (
//         <>
//             <span onClick={() => toggle(`${pwd}${node.name}`)} style={{ cursor: "pointer" }}>
//                 {openFolders[`${pwd}${node.name}`] ? "📂" : "📁"} {node.name}
//             </span>
//             {node.children?.map((dir) => {
//                 <Explorateur dir={dir} pwd={`${pwd}${node.name}`}>

//             })}
//         </>
//     ) : (
//         <span>📄 {node.name}</span>
//     )}
// </li>