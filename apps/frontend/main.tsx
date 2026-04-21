/* extern */
import React            from    'react';
import ReactDOM         from    'react-dom/client';

/* Components */
import ClockProvider    from    'HOOKS/useClock';
import AuthProvider     from    'HOOKS/useAuth';
import App              from    './src/App';
import ViewportProvider from 'HOOKS/useViewport';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ViewportProvider>
            <ClockProvider>
                <AuthProvider>
                    <App/>
                </AuthProvider>
            </ClockProvider>
        </ViewportProvider>
    </React.StrictMode>
);
