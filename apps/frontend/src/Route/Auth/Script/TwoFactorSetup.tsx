import { useState, useEffect, useRef }  from 'react';
import type { AuthChildrenProps }       from '../Auth';
import { authStep }                     from 'HOOKS/useAuth';
import useFetch                         from 'HOOKS/useFetch';

type SetupStep = 'loading' | 'scan' | 'confirm' | 'done' | 'error';

interface SetupPayload {
    qrCode: string;
    accesKey: string;
}

export default function TwoFactorSetup({ setAuthLevel }: AuthChildrenProps) {
    const [step, setStep] = useState<SetupStep>('loading');
    const [payload, setPayload] = useState<SetupPayload | null>(null);
    const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [shake, setShake] = useState<boolean>(false);
    const [secretVisible, setSecretVisible] = useState<boolean>(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { setStep('error'); return; }

        useFetch({
            url: '/api/auth/2fa/setup',
            type_request: {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            },
        }).then(res => {
            if (!res || res.error) { setStep('error'); return; }
            setPayload(res);
            setStep('scan');
        });
    }, []);

    useEffect(() => {
        if (step === 'confirm')
            setTimeout(() => inputsRef.current[0]?.focus(), 100);
    }, [step]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        setError('');
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
        if (value && index === 5) {
            const code = next.join('');
            if (code.length === 6) handleVerify(code);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0)
            inputsRef.current[index - 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const next = Array(6).fill('');
        pasted.split('').forEach((char, i) => { next[i] = char; });
        setDigits(next);
        if (pasted.length === 6) handleVerify(pasted);
    };

    const triggerShake = () => {
        setShake(true);
        setDigits(Array(6).fill(''));
        setTimeout(() => {
            setShake(false);
            inputsRef.current[0]?.focus();
        }, 600);
    };

    const handleVerify = async (code?: string) => {
        const finalCode = code ?? digits.join('');
        if (finalCode.length !== 6) { setError('Code incomplet'); return; }

        const token = localStorage.getItem('token');
        if (!token) { setStep('error'); return; }

        setLoading(true);
        setError('');

        const res = await useFetch({
            url: '/api/auth/2fa/enable',
            type_request: {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ code: finalCode }),
            },
        });

        setLoading(false);

        if (!res || res.error) {
            setError(res?.error ?? 'Code invalide, réessayez');
            triggerShake();
            return;
        }

        setStep('done');
    };

    // ─── LOADING ──────────────────────────────────────────────────────────────
    if (step === 'loading') return (
        <div className={`Script-Auth-root`}>
            <p>Génération du secret <span className={`spinner`}/></p>
        </div>
    );

    // ─── ERROR ────────────────────────────────────────────────────────────────
    if (step === 'error') return (
        <div className={`Script-Auth-root`}>
            <p>Erreur dans la 2FA.</p>
            <p>Êtes-vous connecté ?</p>
            <button onClick={() => window.location.reload()}>
                Réessayer
            </button>
        </div>
    );

    // ─── SCAN ─────────────────────────────────────────────────────────────────
    if (step === 'scan') return (
        <div className={`Script-Auth-root`}>
            <div className={`Script-Auth-header`}>
                <h2>Activer la 2FA</h2>
                <p>Scannez ce QR code avec Google Authenticator, Authy ou toute app TOTP.</p>
            </div>

            <img src={payload!.qrCode} alt="QR code 2FA" />

            <div>

                <p>Saisie manuelle :</p>
                <div style={{ display: "flex",  alignItems: "center",
                    justifyContent: "space-between", gap: "10px", width: "100%"
                }}>
                    <code style={{ flex: 1, wordBreak: "break-all" }}>
                        {secretVisible ? payload!.accesKey : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <button style={{ border: "none", background: "none",boxShadow:"none", cursor: "pointer", flexShrink: 0 }}
                        onClick={() => setSecretVisible(v => !v)}>
                        {secretVisible ? '🙈' : '👁'}
                    </button>
                </div>

            </div>

            <button onClick={() => setStep('confirm')}>
                J'ai scanné → Continuer
            </button>
        </div>
    );

    // ─── CONFIRM ──────────────────────────────────────────────────────────────
    if (step === 'confirm') return (
        <div className={`Script-Auth-root`}>
            <div className={`TwoFactorSetup-header`}>
                <h2>Confirmation</h2>
                <p>Entrez le code généré par votre application pour activer la 2FA.</p>
            </div>

            <div onPaste={handlePaste}>
                {digits.map((digit, i) => (
                    <input key={i} ref={el => { inputsRef.current[i] = el; }}
                        className={`TwoFactorSetup-digit`}
                        type={`text`} inputMode={`numeric`} maxLength={1}
                        value={digit} disabled={loading}
                        onChange={e => handleChange(i, e.target.value)}
                        onKeyDown={e => handleKeyDown(i, e)}
                        autoComplete={`off`}
                    />
                ))}
            </div>

            {error && <p>{error}</p>}

            <button onClick={() => handleVerify()}
                disabled={loading || digits.some(d => !d)} >
                {loading ? <span className={`TwoFactorSetup-spinner`} /> : 'Activer la 2FA'}
            </button>

            <button onClick={() => setStep('scan')} disabled={loading}>
                ← Retour
            </button>
        </div>
    );

    // ─── DONE ─────────────────────────────────────────────────────────────────
    return (
        <div className={`Script-Auth-root`}>
            <h2>2FA activée !</h2>
            <p>Votre compte est maintenant protégé par l'authentification à deux facteurs.</p>
            <button onClick={() => window.location.href = '/'}>
                Terminer →
            </button>
        </div>
    );
}
