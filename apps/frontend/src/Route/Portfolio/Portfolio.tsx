/* extern */
import { useState }                 from    'react';
import { Link }                     from    'react-router-dom';

/* Css */
import './Portfolio.scss';

/* Components */
import { useIDB_tree }              from 'HOOKS/useIDB_tree';
import BackgroundPortfolioInit      from 'COMP/Background/BackgroundPortfolioInit';
import Admin                        from './Admin/Admin';
import Inviter                      from './Inviter/Inviter';
import BasicPortfolio               from './BasicPortfolio/BasicPortfolio';

/* Types */
interface PortfolioProps {
    mode: UserMode ;
}
import type { FileNode, IDBNode }   from '@portfolio/shared';



type UserMode = 'init' | 'inviter' | 'admin' | 'Portfolio';


function hasUser(tree: {fileNode: FileNode[],idbNode: IDBNode[]}): FileNode | undefined {
    return tree?.fileNode.find(
        (node) => node.name === 'user/' && node.type === 'folder'
    );
}

export default function Portfolio({mode = 'init'}: PortfolioProps) {

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
                            <Link className={`change-mode button`} style={{color: 'black'}} to={'/Portfolio/Inviter'}>inviter</Link>
                            <Link className={`change-mode button`} style={{color: 'white'}} to={'/Portfolio/Admin'}>admin</Link>
                        </div>
                        <Link className={`change-mode button`}  to={'/Portfolio/Portfolio'}>oui</Link>
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
                {mode === 'admin' && (
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
                            <Admin idbNode={tree.idbNode} crud={crud}/>
                        )}
                    </>
                
                )}

{/* ─── chaussure ──────────────────────────────────────────────── */}
                {mode === 'Portfolio' && <BasicPortfolio/>}

            </main>
        </div>
    );
}
