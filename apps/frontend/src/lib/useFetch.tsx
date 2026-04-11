// import { authStep, useAuth } from "HOOKS/useAuth";
/* Types */
interface UseFetchProps {
   url: string;
   type_request: RequestInit;
}

const publicApi : string[] = [
    '/api/health',
    '/api/auth/register',
    '/api/auth/login',
    '/api/auth/verify-2fa-login',
]


export default async function useFetch({ url, type_request } : UseFetchProps) {
    
    try {
        
        // const { authLevel, setAuthLevel } = useAuth();

        // if (!publicApi.includes(url) && authLevel !== authStep.CONNECTED) {
        //     console.log(`"${url}(0) without connection u can only use: ${publicApi}`);
        //     return {status: 401, message: "not CONNECTED" }
        // }
        
        console.log(`"${url}(1) call`);

        const response = await fetch(url, type_request);

        console.log(`"${url}(2) response: ${response}`);

        if (response.status >= 400) {
            console.log(`"${url}(3) response.status: ${response.status}`);
        }

        const repjson = await response.json();
        repjson.status = response.status;

        console.log(`"${url}(4) repjson: ${repjson}`);
        

        return repjson;

    } catch(error) {

        console.log(`"${url}(4) error front catch: ${error}`);
        return null;
    
    }
}
