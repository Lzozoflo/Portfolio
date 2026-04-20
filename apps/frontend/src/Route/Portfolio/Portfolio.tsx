/* extern */
import { useState }                 from 'react';

/* Css */
import './Portfolio.scss';

/* Components */
import { useIDB_tree }              from 'HOOKS/useIDB_tree';
import BackgroundPortfolioInit      from 'COMP/Background/BackgroundPortfolioInit';
import Admin                        from './Admin/Admin';
import Inviter                      from './Inviter/Inviter';

/* Types */
import type { FileNode, IDBNode }            from '@portfolio/shared';


type UserMode = 'init' | 'inviter' | 'admin' | 'chaussure';


function hasUser(tree: {fileNode: FileNode[],idbNode: IDBNode[]}): FileNode | undefined {
    return tree?.fileNode.find(
        (node) => node.name === 'user/' && node.type === 'folder'
    );
}

export default function Portfolio() {

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
        <div className='Portfolio-root'>
            <BackgroundPortfolioInit focus={getFocus()} />

            <main className='Portfolio-content'>

{/* ─── INIT ───────────────────────────────────────────────── */}
                {mode === 'init' && (
                    <div className='Portfolio-init-card'>
                        <header>
                            <h1>Portfolio Florent Cretin</h1>
                            <br />
                            <p>Choisissez un mode pour continuer</p>
                        </header>
                        <div className='Portfolio-init-change-mode'>
                            <div className={`change-mode`} onClick={() => setMode('inviter')}>
                                <button>inviter</button>
                            </div>
                            <div className={`change-mode`} onClick={() => setMode('admin')}>
                                <button>admin</button>
                            </div>
                        </div>
                        <div className={`change-mode`} onClick={() => setMode('chaussure')}>
                            <button>oui</button>
                        </div>
                    </div>
                )}

{/* ─── INVITER ────────────────────────────────────────────── */}
                {mode === 'inviter' && (
                    <>
                        {error && (
                            <div style={{ color: 'red'}}>
                                Erreur filesystem : {error}
                            </div>
                        )}

                        {loading && (
                            <div style={{ color: 'lime'}}>
                                Chargement du filesystem...
                            </div>
                        )}
                        
                        {!loading && !error && (
                            <Inviter fileSystem={hasUser(tree)} crud={crud}/>
                        )}
                    </>
                )}


{/* ─── ADMIN ──────────────────────────────────────────────── */}
                {mode === 'admin' && <Admin idbNode={tree.idbNode}/>}

{/* ─── chaussure ──────────────────────────────────────────────── */}
                {mode === 'chaussure' && <Admin idbNode={tree.idbNode}/>}

            </main>
        </div>
    );
}
