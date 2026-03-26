/* extern */
import { useEffect, useState } from 'react';

/* back */

/* Css */
import './Auth.scss'

/* Components */
import { Background } from 'COMP/Background/Background';
import Login from './Script/Login';
import Register from './Script/Register';
import TwoFactorLogin from './Script/TwoFactorLogin';
import TwoFactorSetup from './Script/TwoFactorSetup';

export enum authStep {
    CONNECTED,
    PAGE_LOGIN,
    PAGE_REGISTER,
    PAGE_2FA_LOGIN,
    PAGE_2FA_SETUP,
}

export interface AuthChildrenProps {
    setPage: (step: authStep) => void;
}

export default function Auth() {
    const [page, setPage] = useState<authStep>(authStep.PAGE_LOGIN);
    const [userId, setUserId] = useState<string>('');

    // useEffect(() => {
    //     console.log("value of page: ", page);
    // }, [page]);

    const handleRequires2FA = (id: string) => {
        setUserId(id);
        setPage(authStep.PAGE_2FA_LOGIN);
    };

    return (
        <div className={`Auth-root`}>
            <Background />

            {page === authStep.PAGE_LOGIN && (
                <Login setPage={setPage} onRequires2FA={handleRequires2FA} />
            )}
            {page === authStep.PAGE_REGISTER && (
                <Register setPage={setPage} />
            )}
            {page === authStep.PAGE_2FA_LOGIN && (
                <TwoFactorLogin setPage={setPage} userId={userId} />
            )}
            {page === authStep.PAGE_2FA_SETUP && (
                <TwoFactorSetup setPage={setPage} />
            )}
        </div>
    );
}
