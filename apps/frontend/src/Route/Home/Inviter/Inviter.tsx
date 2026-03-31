/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */
import './Inviter.scss'

/* Components */
import Hr from 'COMP/Hr/Hr'
import Explorateur from "./Explorateur/Explorateur";


/* Types */
import type { FileNode } from '@portfolio/shared';

//interface InviterProps {
//    children: ReactNode;
//    className?: string;
//}

export default function Inviter({ fileSystem }: { fileSystem: FileNode | undefined }) {

    
    return (
        <div className={`Inviter-root`}>
            <Hr initial={335} min2={230}>
                <div className={`Explorateur-root`}>
                    {fileSystem && <Explorateur dir={fileSystem} pwd={`/home/user/`}/>}
                    {!fileSystem && (
                        <div className={`Explorateur-undefined`}>
                            <p>⚠️ /user/ ⚠️</p>
                            <br />
                            <p>directory /user/ was not defined</p>
                        </div>
                    )}
                </div>

        {/* ─── <Hr> vertical </Hr> ───────────────────────────────────────────────── */}

                <div className={`display`}>
                    
                    <div className={`nav-bar`}>

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