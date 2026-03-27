/* BackgroundHomeInit.tsx */
import './BackgroundHomeInit.scss'
import { Background } from "./Background";

interface BackgroundHomeInitProps {
    focus?: 'left' | 'right' | 'both';
}

export default function BackgroundHomeInit({ focus = 'both' }: BackgroundHomeInitProps) {
    return (
        <div className={`BackgroundHomeInit-root focus-${focus}`}>
            <div className="bg-static" />
            <div className="bg-matrix">
                <Background />
            </div>
        </div>
    );
}