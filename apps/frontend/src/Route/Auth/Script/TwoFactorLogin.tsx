import { useState, useRef, useEffect } from 'react';
import type { AuthChildrenProps } from '../Auth';
import { authStep } from '../Auth';
import useFetch from 'HOOKS/useFetch';

interface TwoFactorLoginProps extends AuthChildrenProps {
    userId: string;
}

export default function TwoFactorLogin({ setPage, userId }: TwoFactorLoginProps) {
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [shake, setShake] = useState<boolean>(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        setError('');
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
        if (value && index === 5) {
            const code = next.join('');
            if (code.length === 6) handleSubmit(code);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0)
            inputsRef.current[index - 1]?.focus();
        if (e.key === 'ArrowLeft' && index > 0)
            inputsRef.current[index - 1]?.focus();
        if (e.key === 'ArrowRight' && index < 5)
            inputsRef.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = Array(6).fill('');
        pasted.split('').forEach((char, i) => { next[i] = char; });
        setDigits(next);
        if (pasted.length === 6) handleSubmit(pasted);
    };

    const triggerShake = () => {
        setShake(true);
        setDigits(Array(6).fill(''));
        setTimeout(() => {
            setShake(false);
            inputsRef.current[0]?.focus();
        }, 600);
    };

    const handleSubmit = async (code?: string) => {
        const finalCode = code ?? digits.join('');
        if (finalCode.length !== 6) { setError('Entrez les 6 chiffres'); return; }

        setLoading(true);
        setError('');

        const res = await useFetch({
            url: '/api/auth/verify-2fa-login',
            type_request: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: finalCode }),
            },
        });

        setLoading(false);

        if (!res || res.error) {
            setError(res?.error ?? 'Code invalide ou expiré');
            triggerShake();
            return;
        }

        if (res.token) {
            localStorage.setItem('token', res.token);
            window.location.href = '/';
            return;
        }

        setError('Réponse inattendue');
        triggerShake();
    };

    return (
        <div className="TwoFactorLogin-root">
            <div className="TwoFactorLogin-card">

                <div className="TwoFactorLogin-header">
                    <div className="TwoFactorLogin-icon">⬡</div>
                    <h2 className="TwoFactorLogin-title">Vérification 2FA</h2>
                    <p className="TwoFactorLogin-subtitle">
                        Entrez le code à 6 chiffres de votre application d'authentification
                    </p>
                </div>

                <div
                    className={`TwoFactorLogin-digits${shake ? ' TwoFactorLogin-digits--shake' : ''}`}
                    onPaste={handlePaste}
                >
                    {digits.map((digit, i) => (
                        <input
                            key={i}
                            ref={el => { inputsRef.current[i] = el; }}
                            className={`TwoFactorLogin-digit${digit ? ' TwoFactorLogin-digit--filled' : ''}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            disabled={loading}
                            autoComplete="off"
                        />
                    ))}
                </div>

                {error && <p className="TwoFactorLogin-error">{error}</p>}

                <button
                    className={`TwoFactorLogin-btn${loading ? ' TwoFactorLogin-btn--loading' : ''}`}
                    onClick={() => handleSubmit()}
                    disabled={loading || digits.some(d => !d)}
                >
                    {loading ? <span className="TwoFactorLogin-spinner" /> : 'Confirmer'}
                </button>

                <button
                    className="TwoFactorLogin-back"
                    onClick={() => setPage(authStep.PAGE_LOGIN)}
                    disabled={loading}
                >
                    ← Retour à la connexion
                </button>

            </div>
        </div>
    );
}
