/* BackgroundPortfolioInit.tsx */
import './BackgroundPortfolioInit.scss'
import { Background } from "./Background";

interface BackgroundPortfolioInitProps {
    focus?: 'left' | 'right' | 'both';
}

export default function BackgroundPortfolioInit({ focus = 'both' }: BackgroundPortfolioInitProps) {
    return (
        <div className={`BackgroundPortfolioInit-root focus-${focus}`}>
            <div className={"bg-static"}/>
            <div className="bg-matrix">
                <Background />
            </div>
        </div>
    );
}