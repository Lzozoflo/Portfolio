/* extern */
import { useEffect, useState } from 'react';

/* back */

/* Css */
import './Auth.scss'

/* Components */
import { Background } from 'COMP/Background/Background';
import Login from './Script/Login';
import Register from './Script/Register';


export enum authStep {
    CONNECTED,
    PAGE_LOGIN,
    PAGE_MAILA2F,
    PAGE_REGISTER,
};

/* Interface */
// type AuthStepValue = typeof authStep[keyof typeof authStep];
export interface AuthChildrenProps {
    setPage: (step: authStep) => void;
}

export default function Auth() {

    const [page, setPage] = useState<authStep>(authStep.PAGE_LOGIN);

    useEffect(() => {
        console.log("value of page: ", page)
    }, [page])


    return (
        <div className={`Auth-root`}>
            <Background />

            {page === authStep.PAGE_LOGIN && <Login setPage={setPage}/>}
            {page === authStep.PAGE_REGISTER && <Register setPage={setPage}/>}
            
            {/* {showLog === AUTH.PAGE_MAILA2F && <MailA2F setShowLog={setShowLog}/>} */}
            {/* {showLog === AUTH.PAGE_REGISTER && <Register setShowLog={setShowLog}/>} */}
        </div>
    );
}
