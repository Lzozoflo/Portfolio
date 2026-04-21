import { createContext, useContext, useEffect, ReactNode } from 'react';

const ViewportContext = createContext({});

export default function ViewportProvider({ children }: { children: ReactNode }) {

    useEffect(() => {
        const vp = window.visualViewport;

        function update() {
            if (vp && vp.scale !== 1) return;  // zoom pinch → skip

            const height = vp?.height ?? window.innerHeight;
            const width  = vp?.width  ?? window.innerWidth;

            const root = document.documentElement;
            root.style.setProperty('--vh', `${height * 0.01}px`);
            root.style.setProperty('--wh', `${width  * 0.01}px`);
            window.scrollTo(0,0)
        }

        function onVpScroll() {
            if (vp && vp.scale !== 1) return;  // zoom pinch → skip

            const height = vp?.height ?? window.innerHeight;
            const current = parseFloat(
                document.documentElement.style.getPropertyValue('--vh') || '0'
            ) * 100;

            if (Math.abs(height - current) < 1) return;
            update();
        }

        update();

        vp?.addEventListener('resize', update);
        vp?.addEventListener('scroll', onVpScroll);
        window.addEventListener('resize', update);

        return () => {
            vp?.removeEventListener('resize', update);
            vp?.removeEventListener('scroll', onVpScroll);
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <ViewportContext.Provider value={{}}>
            {children}
        </ViewportContext.Provider>
    );
}

export const useViewport = () => useContext(ViewportContext);