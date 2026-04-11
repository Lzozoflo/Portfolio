import { createContext, useContext, useState, ReactNode  } from 'react';

export enum authStep {
    UNDEFINED,
    CONNECTED,
    PAGE_LOGIN,
    PAGE_REGISTER,
    PAGE_2FA_LOGIN,
    PAGE_2FA_SETUP,
}

interface AuthContextType {
    authLevel: authStep;
    setAuthLevel: (step: authStep) => void;
}

// base value
const AuthContext = createContext<AuthContextType>({
    authLevel: authStep.UNDEFINED,
    setAuthLevel: () => {}
});


export default function AuthProvider({ children }: { children: ReactNode }) {
    const [authLevel, setAuthLevel] = useState<authStep>(authStep.UNDEFINED);

    return (
        <AuthContext.Provider value={{ authLevel, setAuthLevel }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);