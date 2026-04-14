/* extern */
import { useState }      from 'react';

/* Css */
import './Portfolio.scss';

/* Components */
import { useIDB_tree }              from 'HOOKS/useIDB_tree';
import BackgroundHomeInit           from 'COMP/Background/BackgroundHomeInit';
import Admin                        from './Admin/Admin';
import Inviter                      from './Inviter/Inviter';

/* Types */
import type { FileNode }            from '@portfolio/shared';


type UserMode = 'init' | 'inviter' | 'admin';


function hasUser(tree: FileNode[]): FileNode | undefined {
    return tree?.find(
        (node) => node.name === 'user/' && node.type === 'folder'
    );
}

export default function Home() {

    const [mode, setMode] = useState<UserMode>('init');

    const { tree, loading, error, ...crud } = useIDB_tree();

    // Focus du background selon le mode actif
    const getFocus = (): 'both' | 'left' | 'right' => {
        if (mode === 'inviter') return 'left';
        if (mode === 'admin') return 'right';
        return 'both';
    };

    // ── Rendu ────────────────────────────────────────────────────────────────

    return (
        <div className='Home-root'> ;

            <main className='Home-content'>

{/* ─── INIT ───────────────────────────────────────────────── */}
                {mode === 'init' && (
                    <div className='Home-init-card'>
                        <header>
                            <h1>Bienvenu sur mon site..</h1>
                            <p>Choisissez un mode pour continuer</p>
                        </header>
                        <div className='Home-init-change-mode'>
                            <button onClick={() => setMode('inviter')}>inviter</button>
                            <button onClick={() => setMode('admin')}>admin</button>
                        </div>
                    </div>
                )}

{/* ─── INVITER ────────────────────────────────────────────── */}
                {mode === 'inviter' && (
                    <>
                        {loading && (
                            <div style={{ color: 'lime'}}>
                                Chargement du filesystem...
                            </div>
                        )}

                        {error && (
                            <div style={{ color: 'red'}}>
                                Erreur filesystem : {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <Inviter fileSystem={hasUser(tree)} crud={crud}/>
                        )}
                    </>
                )}


{/* ─── ADMIN ──────────────────────────────────────────────── */}
                {mode === 'admin' && <Admin />}

            </main>
        </div>
    );
}
