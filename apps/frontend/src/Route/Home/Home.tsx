/* extern */
import { use, useEffect, useState } from 'react';

/* back */

/* Css */
import './Home.scss';

/* Components */
import { Background } from 'COMP/Background/Background';
import BackgroundHomeInit  from 'COMP/Background/BackgroundHomeInit';
import Admin from './Admin/Admin';
import Inviter from './Inviter/Inviter';


/* Interface */
type UserMode = 'init' | 'inviter' | 'admin';
export type FileNode = {
  name: string;
  type: "file" | "folder";
  data?: string,
  children?: FileNode[];
};

const initfilesystem : FileNode[] = [
    {
        name: "/",
        type: "folder",
        children: [
            {
                name: "oui",
                type: "file",
                data: "chauuuuuuussure!"
             },
            {
                name: "user/",
                type: "folder",
                children: [
                    {
                        name: "ReadMe.md",
                        type: "file",
                        data: "on utilise comme ca:..."
                    },
                    {
                        name: "Experience pro/",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                        ]
                    },
                    {
                        name: "Tech/",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                        ]
                    },
                    {
                        name: "Tool/",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                        ]
                    },
                    {
                        name: "Env/",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                        ]
                    },
                    {
                        name: "Fun",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "on utilise comme ca:..."
                            },
                        ]
                    },
                    {
                        name: "Sandbox/",
                        type: "folder",
                        children: [
                            {
                                name: "ReadMe.md",
                                type: "file",
                                data: "tu est en mode inviter ou admin..."
                            },
                            {
                                name: "Inviter.md",
                                type: "file",
                                data: "tu est en mode inviter alors tu a les seulement le droit de cree des file et dossier ici amuse toi bien"
                            },
                            {
                                name: "Admin.md",
                                type: "file",
                                data: "tu est en mode Admin alors amuse toi bien.. 😏"
                            },
                        ]
                    },
                ]
            }
        ]
    }
];

function hasUser(fileSystem : FileNode[] | undefined) : FileNode | undefined {
    let i = 0;

    if (fileSystem === undefined)
        return undefined

    while (fileSystem[0]?.children && fileSystem[0]?.children[i]) {
        if (fileSystem[0]?.children[i].name === "user/" && fileSystem[0]?.children[i].type === "folder"){
            return fileSystem[0]?.children[i];
        }
        i++;
    }
    return undefined
}



export default function Home() {

    const [mode, setMode] = useState<UserMode>('init');
    const [fileSystem, setFileSystem] = useState<FileNode[] | undefined>(initfilesystem);

    const getFocus = (): 'both' | 'left' | 'right' => {
        if (mode === 'inviter') return 'left';
        if (mode === 'admin') return 'right';
        return 'both';
    };


    // useEffect(() => {
    //     const load = localStorage.getItem("fileSystem");
    //     if (load !== undefined) {
    //         setFileSystem(JSON.parse(load));
    //     }
    // }, []);

    useEffect(() => {
        localStorage.setItem("fileSystem", JSON.stringify(fileSystem));
    }, [fileSystem]);





    return (
        <div className="Home-root">
            <BackgroundHomeInit focus={getFocus()} />

            <main className="Home-content">

{/* ─── INIT ────────────────────────────────────────────────────────────── */}
                {mode === 'init' && (
                    <div className="Home-init-card">
                        <header>
                            <h1>Bienvenu sur mon site..</h1>
                            <p>Choisissez un mode pour continuer</p>
                        </header>
                        <div className="Home-init-change-mode">
                            <button onClick={() => setMode('inviter')}>inviter</button>
                            <button onClick={() => setMode('admin')}>admin</button>
                        </div>
                    </div>
                )}

{/* ─── INVITER ────────────────────────────────────────────────────────────── */}
                {mode === 'inviter' && <Inviter fileSystem={hasUser(fileSystem)}/>}

{/* ─── ADMIN ────────────────────────────────────────────────────────────── */}
                {mode === 'admin' && <Admin />}
                
            </main>
        </div>
    );
}