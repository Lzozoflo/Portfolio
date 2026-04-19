/* extern */
import { useEffect }                        from    'react';
import { BrowserRouter, Routes, Route }     from    'react-router-dom';

/* Css */
import 'STYLE/index.scss';

/* Components */
import { authStep, useAuth }                from    'HOOKS/useAuth';
import ErrorRedir                           from    './Route/ErrorRedir/ErrorRedir';
import Auth                                 from    './Route/Auth/Auth';
import Portfolio                            from    './Route/Portfolio/Portfolio';


export default function App() {

    const { authLevel, setAuthLevel } = useAuth();

    useEffect(() => {
        
        if (authLevel === authStep.UNDEFINED){
            setAuthLevel(authStep.PAGE_LOGIN); // TODO FAIRE UN checkTokenAuth(token)
        }

        const handleResize = () => {
            // On calcule 1% de la hauteur réelle visible
            const vh = window.innerHeight * 0.01;
            const wh = window.innerWidth * 0.01;
            // On l'injecte dans le style de l'élément racine
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            document.documentElement.style.setProperty('--wh', `${wh}px`);
        };

        handleResize();

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [])

    return (
        <BrowserRouter>
            <Routes>

                <Route path={`/`}               element={<Portfolio />} />
                <Route path={`/auth`}           element={<Auth />} />

                {/* private root */}
                <Route path={`/*`}              element={<ErrorRedir />} />
                
            </Routes>
        </BrowserRouter>
    );
}
