/* extern */
import { SetStateAction, useEffect, useState } from "react";


/* back */


/* Css */
// import 'Register.scss'

/* Components */
import { authStep, AuthChildrenProps } from "FRONT/Route/Auth/Auth"
import useFetch from "FRONT/hooks/useFetch";

/* Types */

interface LoginForm {
    username: string;
    email: string;
    password: string;
}

export default function Register({ setPage }: AuthChildrenProps) {

    const [form, setForm] = useState<LoginForm>({ username:'', email: '', password: '' });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [pwVisible, setPwVisible] = useState<boolean>(false);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const registerSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {

        e.preventDefault();

        if (!form.username || !form.email || !form.password) {
            setError("Veuillez remplir tous les champs");
            return;
        }

        setLoading(true);
        setError('');

        const api_url = `/api/auth/register`;
        
        console.log(`${api_url}:`, api_url);

        const repjson = await useFetch({
            url:  `${api_url}`,
            type_request: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            }
        });

        setLoading(false);
        if (!repjson || repjson.error) {
            setError(repjson?.error ?? 'Email ou mot de passe invalide');
            return;
        }

        console.log('oui', repjson);

        if (repjson.token) {
            localStorage.setItem('token', repjson.token);
            setPage(authStep.PAGE_2FA_SETUP);
            return;
        }

        setError('Réponse inattendue du serveur');

    };



    return (
        <div className={`Script-Auth-root`}>
            <h2>Inscription</h2>
            <form className={`Form-root`} onSubmit={registerSubmit}>

                <label htmlFor={`register-username`}>Username</label>
                <input id={`register-username`} 
                        type={`text`} name={`username`}
                        value={form.username}
                        onChange={handleChange}
                        placeholder={`XxXDarkSasukeXxX`}
                        disabled={loading}/>
                
                <label htmlFor={`register-email`}>Email</label>
                <input id={`register-email`} 
                    type={`email`} name={`email`}
                    value={form.email}
                    onChange={handleChange}
                    placeholder={`you@example.com`}
                    disabled={loading}
                />


                <div className={`Form-field`}>

                    <label htmlFor={`register-password`}>Mot de passe</label>
                    <div className={`eyes-on-off`}>

                        <input id={`register-password`}
                            type={pwVisible ? 'text' : 'password'} name={`password`}
                            value={form.password}
                            onChange={handleChange}
                            placeholder={`••••••••`}
                            disabled={loading}
                        />

                        <button type={`button`}
                            className={`pw-toggle`}
                            onClick={() => setPwVisible(v => !v)}
                            tabIndex={-1}>
                            {pwVisible ? '🙈' : '👁'}
                        </button>

                    </div>

                </div>

                {error && <p className={`Login-error`} >{error}</p>}
                <input type={`submit`} value={`Register`}/>  
                
            </form>
            
            <div className={`redir-log-reg`}>
                <p >Deja un compte ?</p>
                <button onClick={(e) => {e.preventDefault(); setPage(authStep.PAGE_LOGIN)}}
                    disabled={loading}>
                    Se connecter
                </button>
            </div>

        </div>
    )
}