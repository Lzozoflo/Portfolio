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

export default function Home() {
    const [mode, setMode] = useState<UserMode>('init');

    // On détermine le focus du fond en fonction du mode
    const getFocus = (): 'both' | 'left' | 'right' => {
        if (mode === 'inviter') return 'left';
        if (mode === 'admin') return 'right';
        return 'both';
    };

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
                {mode === 'inviter' && <Inviter />}                
{/* ─── ADMIN ────────────────────────────────────────────────────────────── */}
                {mode === 'admin' && <Admin />}
                
            </main>
        </div>
    );
}