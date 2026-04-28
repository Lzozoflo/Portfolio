/* extern */
import { useEffect }                        from    'react';
import { BrowserRouter, Routes, Route }     from    'react-router-dom';

/* Css */
import 'STYLE/index.scss';

/* Components */
import { useKeyboardStore }                 from    'HOOKS/useKeyboardStore';
import { authStep, useAuth }                from    'HOOKS/useAuth';
import ErrorRedir                           from    './Route/ErrorRedir/ErrorRedir';
import Auth                                 from    './Route/Auth/Auth';
import Portfolio                            from    './Route/Portfolio/Portfolio';
import SpacyGamesTool                       from    './Route/SpacyGamesTool/SpacyGamesTool';


export default function App() {

    const { authLevel, setAuthLevel } = useAuth();
    const open   = useKeyboardStore((state) => state.open);
    const close  = useKeyboardStore((state) => state.close);

    useEffect(() => {
        
        if (authLevel === authStep.UNDEFINED){
            setAuthLevel(authStep.PAGE_LOGIN); // TODO FAIRE UN checkTokenAuth(token)
        }

        const handleResize = () => {
            if (window.innerHeight < 450)
                 open();
            else
                close();
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

                <Route path={`/`}              element={ <Portfolio mode={'init'}                   />} />
                <Route path={`/Portfolio`}              element={ <Portfolio mode={'init'}          />} />
                <Route path={`/Portfolio/Inviter`}      element={ <Portfolio mode={'inviter'}       />} />
                <Route path={`/Portfolio/Admin`}        element={ <Portfolio mode={'admin'}         />} />
                <Route path={`/Portfolio/Portfolio`}    element={ <Portfolio mode={'Portfolio'}     />} />
                <Route path={`/auth`}                   element={ <Auth                             />} />
                <Route path={`/SpacyGamesTool`}         element={ <SpacyGamesTool                   />} />

                {/* private root */}
                <Route path={`/*`}                      element={ <ErrorRedir                       />} />
                
            </Routes>
        </BrowserRouter>
    );
}
