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
