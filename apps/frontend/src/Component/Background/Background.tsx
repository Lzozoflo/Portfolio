/* extern */
import React, { useEffect, useRef } from 'react';

/* back */

/* Css */
// import 'Background.scss'

/* Components */

export const Background: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Initialisation forcée des dimensions
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();

        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄ';
        const fontSize = 16;
        let columns = Math.floor(canvas.width / fontSize);
        let drops: number[] = Array.from({ length: columns }, () => Math.random() * -250);

        const draw = () => {
            // Effet de traînée (trail)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#0F0';
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);

                if (drops[i] * fontSize > canvas.height && Math.random() > 0.989) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        };

        const interval = setInterval(draw, 60);

        window.addEventListener('resize', () => {
            resizeCanvas();
            // columns = Math.floor(canvas.width / fontSize);
            // drops = Array.from({ length: columns }, () => Math.random() * -250);
        });

        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, [canvasRef]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                background: '#000',
                display: 'block'
            }}
        />
    );
};
