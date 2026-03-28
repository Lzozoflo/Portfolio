/* extern */
import { useEffect, useState } from "react";


/* back */


/* Css */
import './Explorateur.scss'

/* Components */


/* Interface */
import { FileNode } from "FRONT/Route/Home/Home";

//interface ExplorateurProps {
//    children: ReactNode;
//    className?: string;
//}

export default function Explorateur({ dir }:{ dir: FileNode | undefined}) {


    return (
        <ul className={`Explorateur-Comp`}>
            <li>📁 dossier
                <ul>
                    <li>📁 dossier
                        {/* <ul>
                            <li>📄 file</li>
                            <li>📄 file</li>
                            <li>📄 file</li>
                            <li>📄 file</li>
                            <li>📄 file</li>
                            </ul> */}
                    </li>
                    <li>📁 dossier</li>
                    <li>📄 file</li>
                    <li>📄 file</li>
                    <li>📄 file</li>
                </ul>
            </li>
            <li>📄 ceci_est_un_long_test_pour_voir_ce_que_ca_donne</li>
            <li>📄 ceci_est_un_long_test_pour_voir_ce_que_ca_donne</li>
            <li>📄 ceci-est-un-long-test-pour-voir-ce-que-ca_donne</li>
            <li>📄 ceci est un long test pour voir ce que ca_donne</li>
            <li>📄 file</li>
            <li>📄 file</li>
            <li>📄 file</li>
        </ul>
    )

}