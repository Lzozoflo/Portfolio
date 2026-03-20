/* extern */
// import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* back */

/* Css */
import 'STYLE/index.scss';

/* Components */
import Auth from './Route/Auth/Auth';
import { Background } from './Route/Background/Background';
import ErrorRedir from './Route/ErrorRedir/ErrorRedir';
import Home from './Route/Home/Home';

export default function App() {
    // useEffect(() => {
    // }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path={`/`} element={<Home />} />
                <Route path={`/auth`} element={<Auth />} />

                {/* bad path */}
                <Route path={`/*`} element={<ErrorRedir />} />
            </Routes>
        </BrowserRouter>
    );
}
