/* extern */
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";


/* back */


/* Css */
import 'STYLE/index.scss'


/* Components */
import Home from './Home/Home'
import ErrorRedir from './ErrorRedir/ErrorRedir'

export default function App() {

    // useEffect(() => {
    // }, []);

    return (
        <BrowserRouter>
            <Routes>


                {/* Home */}
                <Route path={`/`}                       element={<Home />} />

                {/* bad path */}
                <Route path={`/*`}                      element={<ErrorRedir/>} />


            </Routes>
        </BrowserRouter>
    );
};