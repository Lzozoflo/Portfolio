/* extern */
import { useEffect, useState } from 'react';

/* back */

/* Css */
import './Home.scss';

/* Components */
import BackgroundHomeInit  from 'COMP/Background/BackgroundHomeInit';

export default function Home() {

    const [mode , setMode] = useState<string>('init');

    if (mode === 'init') {

        return (
            <div className={`Home-init-root`}>
                <BackgroundHomeInit/>
                <div className={`Home-init-card`}>
                    <header>
                        <h1>Bienvenu sur mon site..</h1>
                        <p>je vous invite a choisir un mode pour vous deplacer sur le site</p>
                    </header>
                    
                    <div className={`Home-init-change-mode`}>
                        <button onClick={() => {setMode('inviter')} }>inviter</button>
                        <button onClick={() => {setMode('admin')} }>admin</button>
                    </div>
                </div>
            </div>
        );
    }
//     if (mode === "inviter") {

//         return (
//             <div className={`Home-root`}>

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
//         );
//     }

//     if (mode === "admin") {

//         return (
//             <div className={`Home-root`}>

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
//         );
//     }
}
