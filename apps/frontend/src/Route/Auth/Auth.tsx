/* extern */
import { useEffect, useState }  from 'react';

/* back */

/* Css */
import './Auth.scss'

/* Components */
import { authStep, useAuth }    from 'HOOKS/useAuth';
import { Background }           from 'COMP/Background/Background';
import Login                    from './Script/Login';
import Register                 from './Script/Register';
import TwoFactorLogin           from './Script/TwoFactorLogin';
import TwoFactorSetup           from './Script/TwoFactorSetup';

export interface AuthChildrenProps {
    setAuthLevel: (step: authStep) => void;
}

export default function Auth() {
    const { authLevel, setAuthLevel } = useAuth();

    const [userId, setUserId] = useState<string>('');

    const handleRequires2FA = (id: string) => {
        setUserId(id);
        setAuthLevel(authStep.PAGE_2FA_LOGIN);
    };

    return (
        <div className={`Auth-root`}>
            <Background />

            {authLevel === authStep.PAGE_LOGIN && (
                <Login setAuthLevel={setAuthLevel} onRequires2FA={handleRequires2FA} />
            )}
            {authLevel === authStep.PAGE_REGISTER && (
                <Register setAuthLevel={setAuthLevel} />
            )}
            {authLevel === authStep.PAGE_2FA_LOGIN && (
                <TwoFactorLogin setAuthLevel={setAuthLevel} userId={userId} />
            )}
            {authLevel === authStep.PAGE_2FA_SETUP && (
                <TwoFactorSetup setAuthLevel={setAuthLevel} />
            )}
        </div>
    );
}
