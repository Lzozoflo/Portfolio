import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';
import "./Hr.scss";

interface HrProps {
    children: [ReactNode, ReactNode];
    mode?: 'row' | 'column';
    min1?: number;
    min2?: number;
    initial?: number;
    thickness?: number;
}

export default function Hr({ children, mode = 'row', min1 = 100, min2 = 100, initial = 200, thickness = 4 }: HrProps) {
    
    const rootRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef<boolean>(false);
    const isCol = mode === 'column';
    
    const [size1, setSize1] = useState<number>(initial);
    const [totalSize, setTotalSize] = useState<number>(0);

    useEffect(() => {
        if (!rootRef.current) return;

        const resizeObserver = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const { width, height } = entry.contentRect;
                const currentTotal = isCol ? height : width;
                setTotalSize(currentTotal);
                setSize1(prev => Math.min(prev, currentTotal - thickness - min2));
            }
        });

        resizeObserver.observe(rootRef.current);
        return () => resizeObserver.disconnect();
    }, [isCol, min2, thickness]);

    const onPointerMove = useCallback((e: PointerEvent) => {
        if (!isDragging.current || !rootRef.current) return;

        const rect = rootRef.current.getBoundingClientRect();
        const currentPos = isCol ? (e.clientY - rect.top) : (e.clientX - rect.left);
        const clampedPos = Math.max(min1, Math.min(currentPos, totalSize - thickness - min2));

        setSize1(clampedPos);
    }, [min1, min2, totalSize, isCol, thickness]);

    useEffect(() => {
        const stop = () => { isDragging.current = false; };
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', stop);
        return () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', stop);
        };
    }, [onPointerMove]);

    const size2 = totalSize - size1 - thickness;
    const dimensionKey = isCol ? 'height' : 'width';

    return (
        <div ref={rootRef} className="Hr-root" style={{ display: 'flex', flexDirection: mode, width: '100%', height: '100%' }}>
            <div style={{ [dimensionKey]: `${size1}px` }}>
                {children[0]}
            </div>
            <hr 
                onPointerDown={() => { isDragging.current = true; }}
                style={{ 
                    [dimensionKey]: thickness,
                    background: 'black', 
                    border: 'none', 
                    margin: 0,
                    cursor: isCol ? 'row-resize' : 'col-resize'
                }}
            />
            <div style={{ [dimensionKey]: `${size2}px` }}>
                {children[1]}
            </div>
        </div>
    );
}