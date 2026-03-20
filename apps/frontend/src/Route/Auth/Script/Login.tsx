/* extern */
// import { SetStateAction, useEffect, useState } from "react";


/* back */


/* Css */
// import 'Login.scss'

/* Components */
import { authStep, AuthChildrenProps } from "FRONT/Route/Auth/Auth"
import useFetch from "FRONT/hooks/useFetch";

/* Interface */

export default function Login({ setPage }: AuthChildrenProps) {

    const loginSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {

		event.preventDefault();
        const form = event.target;

        const data = {
            email: form.email.value.trim(),
            password: form.password.value.trim(),
            // host: window.location.host
        };

        if (!data.email || !data.password) {
            console.log("loginSubmit(1) Veuillez remplir tous les champs", "danger");
            return;
        }

        const api_url = `/api/auth/login`;
        
        console.log(`${api_url}:`, api_url);

        const repjson = await useFetch({
            url:  `${api_url}`,
            type_request: {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }
        });
        if (!repjson)
            return
        
        console.log('oui', repjson);

        // sessionStorage.setItem('type', "success");
        // sessionStorage.setItem('message', "Connexion réussie");
        // sessionStorage.setItem('token', repjson.token);
        // sessionStorage.setItem('username', repjson.username);

    };


    return (
        <div className={`Login-root`}>

            <form className={`Form-root`} onSubmit={loginSubmit}>

                <label htmlFor={`email`}>Email</label>
                <input id={`email`} type={`text`}/>
                
                <label htmlFor={`password`}>Password</label>
                <input id={`password`} type={`password`}/>
                
                <input type={`submit`} value={`Login`}/>
                <button onClick={(e) => {e.preventDefault(); setPage(authStep.PAGE_REGISTER)}}>Go To Register</button>

            </form>

        </div>
    )
}