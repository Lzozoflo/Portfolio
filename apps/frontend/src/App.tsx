/* extern */
// import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* back */

/* Css */
import 'STYLE/index.scss';

/* Components */
import ClockProvider    from 'HOOKS/useClock';
import AuthProvider     from 'HOOKS/useAuth';
import ErrorRedir       from './Route/ErrorRedir/ErrorRedir';
import Auth             from './Route/Auth/Auth';
import Home             from './Route/Home/Home';

export default function App() {
    
    
    return (
        <ClockProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path={`/`}       element={<Home />} />
                        <Route path={`/auth`}   element={<Auth />} />

                        {/* private root */}
                        <Route path={`/*`}      element={<ErrorRedir />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </ClockProvider>
    );
}
