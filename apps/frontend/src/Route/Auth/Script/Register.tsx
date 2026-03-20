/* extern */
import { SetStateAction, useEffect, useState } from "react";


/* back */


/* Css */
// import 'Register.scss'

/* Components */
import { authStep, AuthChildrenProps } from "FRONT/Route/Auth/Auth"

/* Interface */

export default function Register({ setPage }: AuthChildrenProps) {
    return (
        <div className={`Register-root`}>

            <form className={`Form-root`}>

                <label htmlFor={`username`}>Username</label>
                <input id={`username`} type={`text`}/>
                
                <label htmlFor={`email`}>Email</label>
                <input id={`email`} type={`email`}/>

                <label htmlFor={`password`}>Password</label>
                <input id={`password`} type={`password`}/>
                
                <input type={`submit`} value={`Register`}/>
                <button onClick={(e) => {e.preventDefault(); setPage(authStep.PAGE_LOGIN)}}>Ce Register</button>
                
            </form>

        </div>
    )
}