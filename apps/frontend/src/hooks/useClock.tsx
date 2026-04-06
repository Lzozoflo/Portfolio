import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ClockContextType {
    time: string;
}

const ClockContext = createContext<ClockContextType | undefined>(undefined);

export default function ClockProvider({ children }: { children: ReactNode }) {


    const formatTime = () => 
        new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false 
        });

    const [time, setTime] = useState(formatTime);

    useEffect(() => {
        const interval = setInterval(() => setTime(formatTime()), 1000);
        return () => clearInterval(interval);
    }, []);


    
    return (
        <ClockContext.Provider value={{ time }}>
            {children}
        </ClockContext.Provider>
    );


}

export const useClock = () => {
    const context = useContext(ClockContext);
    if (!context) throw new Error("useClock must be used within a ClockProvider");
    return context;
};