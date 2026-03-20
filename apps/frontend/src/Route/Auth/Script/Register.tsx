/* extern */
// import { SetStateAction, useEffect, useState } from "react";


/* back */


/* Css */
// import 'Register.scss'

/* Components */
import { authStep, AuthChildrenProps } from "FRONT/Route/Auth/Auth"
import useFetch from "FRONT/hooks/useFetch";

/* Interface */

export default function Register({ setPage }: AuthChildrenProps) {


    const registerSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {

        event.preventDefault();
        const form = event.target;

        const data = {
            username: form.username.value.trim(),
            email: form.email.value.trim(),
            password: form.password.value.trim(),
            // host: window.location.host
        };

        if (!data.username || !data.email || !data.password) {
            console.log("registerSubmit(1) Veuillez remplir tous les champs", "danger");
            return;
        }

        const api_url = `/api/auth/register`;
        
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

    };



    return (
        <div className={`Register-root`}>

            <form className={`Form-root`} onSubmit={registerSubmit}>

                <label htmlFor={`username`}>Username</label>
                <input id={`username`} type={`text`}/>
                
                <label htmlFor={`email`}>Email</label>
                <input id={`email`} type={`email`}/>

                <label htmlFor={`password`}>Password</label>
                <input id={`password`} type={`password`}/>
                
                <input type={`submit`} value={`Register`}/>
                <button onClick={(e) => {e.preventDefault(); setPage(authStep.PAGE_LOGIN)}}>Go To Login</button>
                
            </form>

        </div>
    )
}