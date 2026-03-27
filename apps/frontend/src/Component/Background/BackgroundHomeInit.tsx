/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */

import './BackgroundHomeInit.scss'

/* Components */
import { Background } from "./Background";

/* Interface */
//interface BackgroundHomeInitProps {
//    children: ReactNode;
//    className?: string;
//}

export default function BackgroundHomeInit() {
    return (
        <div className={`BackgroundHomeInit-root`}>
            <div className="bg-static" />
            <div className="bg-matrix">
                <Background/>
            </div>
        </div>
    )
}