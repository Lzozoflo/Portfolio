/* Interface */
interface UseFetchProps {
   url: string;
   type_request: RequestInit;
}

export default async function useFetch({url, type_request}: UseFetchProps){
    console.log("useFetch(1) url:", url);
    try {

        const response = await fetch(url, type_request);
        console.log("useFetch(2:",url,") after fetch response:", response);

        const repjson = await response.json();
        if (response.status >= 400){
            console.log("useFetch(3:",url,") response.status >= 400...",response.status)
            console.log("  repjson", repjson)
        }

        console.log("useFetch(4:",url,") success repjson:", repjson);
        return repjson;

    }catch(error){
        console.log("useFetch(5:",url,") error front :", error);
        return null;
    }
}

// import useFetch from "HOOKS/useFetch.tsx";

// const api_url = ``;

// const repjson = await useFetch(`${api_url}`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(data)
// });