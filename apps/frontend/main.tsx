/* extern */
import React            from    'react';
import ReactDOM         from    'react-dom/client';

/* Components */
import ClockProvider    from    'HOOKS/useClock';
import AuthProvider     from    'HOOKS/useAuth';
import App              from    './src/App';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ClockProvider>
            <AuthProvider>
                <App/>
            </AuthProvider>
        </ClockProvider>
    </React.StrictMode>
);
