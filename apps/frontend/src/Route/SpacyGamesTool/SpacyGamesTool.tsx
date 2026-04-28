/* Extern */
import { useEffect, useState } from "react";


/* Back */


/* Css */
import './SpacyGamesTool.scss'
import useFetch from "FRONT/lib/useFetch";

/* Components */

/* Types */
//interface SpacyGamesToolProps {
//    children: ReactNode;
//    className?: string;
//}

export default function SpacyGamesTool() {

    function handleAdd(data: { [k: string]: FormDataEntryValue }){
        if (data.galaxie === '' || data.system === '' || data.planete === ''){
            console.error("Empty Logique Ajout :", data);
            return;
        }
        console.log("Logique Ajout :", data);
        const handleFetch = async () => {
            const api_url = `/api/spacyGameTool/galaxie`;
        
            const repjson = await useFetch({
                url:  `${api_url}`,
                type_request: {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                }
            });
            if (repjson?.success)
                console.log('oui', repjson);
            return repjson;
        };
        const repjson = handleFetch();
        
    }

    function handleSearch(data: { [k: string]: FormDataEntryValue }){
        if (data.galaxie === '' || data.System === '' || data.planete === ''){
            console.error("Empty Logique Recherche :", data);
            return;
        }
        console.log("Logique Recherche :", data);

    }
    
    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Extraction des données du formulaire
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());
        
        // Récupération de l'action via le bouton cliqué (e.nativeEvent.submitter)
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
        const action = submitter.name;

        if (action === 'add') {
            handleAdd(data)
        } else if (action === 'search') {
            handleSearch(data)
        }
    };

    return (
        <div className={`SpacyGamesTool-root`}>
            <form onSubmit={(e) => {handleSubmit(e);}}>

                <div className={`lable-input`}>
                    <label htmlFor={`galaxie`}>Galaxie</label>
                    <input  name={`galaxie`} id={`galaxie`}
                            type={'text'} inputMode={`numeric`} maxLength={1}
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')}
                    />
                    <div>
                        {/* arrow up  + 1 */}
                        {/* base 0 */}
                        {/* arrow down - 1 */}
                    </div>
                </div>

                <div className={`lable-input`}>
                    <label htmlFor={`system`}>System</label>
                    <input  name={`system`} id={`system`}
                            type={'text'} inputMode={`numeric`} maxLength={3}
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')}
                    />
                </div>

                <div className={`lable-input`}>
                    <label htmlFor={`planete`}>Planete</label>
                    <input  name={`planete`} id={`planete`}
                            type={'text'} inputMode={`numeric`} maxLength={1}
                            onInput={(e) => e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')}
                    />
                </div>

                <div className={`submit-search-add`}>
                    <button type={`submit`} name={`add`}>add</button>
                    <button type={`submit`} name={`search`}>search</button>
                </div>
            </form>
        </div>
    )
}