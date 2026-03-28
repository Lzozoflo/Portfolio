/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */
import './Inviter.scss'

/* Components */
import Hr from 'COMP/Hr/Hr'
import Explorateur from "./Explorateur/Explorateur";


/* Interface */
import { FileNode } from "FRONT/Route/Home/Home";
//interface InviterProps {
//    children: ReactNode;
//    className?: string;
//}

export default function Inviter({ fileSystem }: { fileSystem: FileNode | undefined }) {




    return (
        <div className={`Inviter-root`}>
            <Hr>
                <div className={`Explorateur-root`}>
                    {fileSystem && <Explorateur dir={fileSystem}/>}
                    {!fileSystem && (
                        <div className={`Explorateur-undefined`}>
                            <p>⚠️ /user/ ⚠️</p>
                            <br />
                            <p>directory /user/ was not defined</p>
                        </div>
                    )}
                </div>

                <div className={`display`}>
                    
                    <div className={`nav-bar`}>
                        {/* click sur un des file dans l'explorateur mets un onglet ici et ouvre dans le display-file */}
                    </div>

                    <div className={`display-file`}>
            
                        <h1>Hi im Florent Cretin</h1>

                    </div>

                </div>
            </Hr>
        </div>
    )
}



//                 {/* frontend

//                 React
//                 JavaScript/TypeScript
//                 Scss


//                 backend

//                 Node.js
//                 Express.js

//                 database

//                 MySQL
//                 sequalize

//                 PostgreSQL
//                 Prisma

//                 tools
//                 man zshmisc
//                 Shell
//                 Git
//                 Docker */}
//             </div>