/* extern */
import { useEffect, useState } from 'react';

/* Css */
import './Home.scss';

/* Components */
import BackgroundHomeInit from 'COMP/Background/BackgroundHomeInit';
import Admin from './Admin/Admin';
import Inviter from './Inviter/Inviter';

/* Hooks */
import { useFilesystem } from 'HOOKS/useFilesystem';

/* Types */
export type { FileNode } from '@portfolio/shared';

// ─────────────────────────────────────────────────────────────────────────────
// Types locaux
// ─────────────────────────────────────────────────────────────────────────────

type UserMode = 'init' | 'inviter' | 'admin';

// ─────────────────────────────────────────────────────────────────────────────
// Utilitaires
// ─────────────────────────────────────────────────────────────────────────────

/**
 * hasUser — Trouve le nœud /user/ dans l'arbre reconstruit.
 *
 * L'arbre retourné par useFilesystem ressemble à :
 *   [
 *     { name: "/", type: "folder", children: [
 *         { name: "user/", type: "folder", children: [...] },
 *         ...
 *     ]}
 *   ]
 *
 * On cherche dans les enfants de la racine ("/") le dossier nommé "user/".
 */
import type { FileNode } from '@portfolio/shared';

function hasUser(tree: FileNode[]): FileNode | undefined {
    // tree[0] = nœud racine "/"
    // tree[0].children = enfants directs de la racine

    console.log("hasUser:",tree);
    return tree?.find(
        (node) => node.name === 'user/' && node.type === 'folder'
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Composant
// ─────────────────────────────────────────────────────────────────────────────
import { useIDB_tree } from 'FRONT/hooks/useIDB_tree';

export default function Home() {

    const [mode, setMode] = useState<UserMode>('init');

    const { tree, loading, error } = useIDB_tree();

    // Focus du background selon le mode actif
    const getFocus = (): 'both' | 'left' | 'right' => {
        if (mode === 'inviter') return 'left';
        if (mode === 'admin') return 'right';
        return 'both';
    };

    // ── Rendu ────────────────────────────────────────────────────────────────

    return (
        <div className='Home-root'>
            <BackgroundHomeInit focus={getFocus()} />

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
                        {/* IDB en cours de chargement (typiquement < 50ms) */}
                        {loading && (
                            <div style={{ color: 'lime', fontFamily: 'monospace' }}>
                                Chargement du filesystem...
                            </div>
                        )}

                        {/* Erreur IDB (navigateur sans support, quota dépassé, etc.) */}
                        {error && (
                            <div style={{ color: 'red', fontFamily: 'monospace' }}>
                                Erreur filesystem : {error}
                            </div>
                        )}

                        {/* Rendu normal — on passe le nœud /user/ à Inviter */}
                        {/* L'interface de <Inviter> est INCHANGÉE : fileSystem?: FileNode */}
                        {!loading && !error && (
                            <Inviter fileSystem={hasUser(tree)} />
                        )}
                    </>
                )}

                {/* ─── ADMIN ──────────────────────────────────────────────── */}
                {/* TODO: passer les opérations du hook (ls, cat, mkdir, ...) à Admin */}
                {mode === 'admin' && <Admin />}

            </main>
        </div>
    );
}
