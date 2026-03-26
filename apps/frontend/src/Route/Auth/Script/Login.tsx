/* extern */
import { useState } from 'react';


/* back */


/* Css */

/* Components */
import { authStep } from '../Auth';
import type { AuthChildrenProps } from '../Auth';
import useFetch from 'HOOKS/useFetch';

/* Interface */

interface LoginProps extends AuthChildrenProps {
    onRequires2FA: (userId: string) => void;
}

interface LoginForm {
    email: string;
    password: string;
}



export default function Login({ setPage, onRequires2FA }: LoginProps) {
    const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [pwVisible, setPwVisible] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        
        e.preventDefault();
        if (!form.email || !form.password) {
            setError('Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        setError('');

        const api_url = '/api/auth/login';
        
        console.log(`${api_url}:`, api_url);

        const repjson = await useFetch({
            url:  `${api_url}`,
            type_request: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            },
        });

        setLoading(false);



        // 2FA requis
        if (repjson?.requires2FA && repjson?.userId) {
            onRequires2FA(repjson.userId);
            return;
        }

        if (repjson?.token) {
            localStorage.setItem('token', repjson.token);
            return;
        }

        setError('Réponse inattendue du serveur');
    };

    return (
        <div className={`Script-Auth-root`}>

            <h2>Connexion</h2>

            <form className={`Form-root`}  onSubmit={handleSubmit} noValidate>

                <div className={`Form-field`}>

                    <label htmlFor={`login-email`}>Email</label>
                    <input id={`login-email`} type={`email`} name={`email`}
                        value={form.email}
                        onChange={handleChange}
                        placeholder={`you@example.com`}
                        disabled={loading}
                    />

                </div>

                <div className={`Form-field`}>

                    <label htmlFor={`login-password`}>Mot de passe</label>
                    <div className={`eyes-on-off`}>

                        <input id={`login-password`}
                            type={pwVisible ? 'text' : 'password'} name={`password`}
                            value={form.password}
                            onChange={handleChange}
                            placeholder={`••••••••`}
                            disabled={loading}/>

                        <button type={`button`}
                            className={`pw-toggle`}
                            onClick={() => setPwVisible(v => !v)}
                            tabIndex={-1}>
                            {pwVisible ? '🙈' : '👁'}
                        </button>

                    </div>

                </div>

                {error && <p className={`Login-error`} >{error}</p>}
                <input type={`submit`} value={`Se connecter`} disabled={loading}/> 

            </form>
            <div className={`redir-log-reg`}>
                <p>Pas de compte ?</p>
                <button onClick={(e) => {e.preventDefault(); setPage(authStep.PAGE_REGISTER)}}
                    disabled={loading}>
                    S'inscrire
                </button>
            </div>
        </div>
    );
}
