
import type { IDBNode, focusIDBNode, State }           from '@portfolio/shared';

type Action = 
    | { type: 'NEWFOCUS'; path: string }
    | { type: 'OPEN'; file: IDBNode | undefined }
    | { type: 'UPDATE'; data: string }
    | { type: 'CLOSE'; path: string };

// export type focusIDBNode = {
//     file: IDBNode,
//     focus: boolean,
// }

// export type State = {
//     files: focusIDBNode[],
//     current: IDBNode | undefined;
// } | undefined;

export default function fileReducer(state: State, action: Action): State {
    switch (action.type) {

        case 'NEWFOCUS': {
            // 1. Si pas d'état ou pas de chemin, on ne fait rien
            if (!state || !action.path) return state;

            // 2. Trouver le fichier correspondant au path
            const targetNode = state.files.find(f => f.file.path === action.path);
            
            // 3. Si le fichier n'est pas ouvert, on retourne l'état actuel
            if (!targetNode) return state;

            // 4. Mettre à jour la liste (focus) et le current
            return {
                files: state.files.map(f => ({
                    ...f,
                    focus: f.file.path === action.path
                })),
                current: targetNode.file
            };
        }

        case 'OPEN': {
            const file = action.file;
            if (!file) return state;

            const files = state?.files ?? [];
            
            const alreadyOpen = files.find(f => f.file.path === file.path);
            if (alreadyOpen?.focus) return state
            if (alreadyOpen) {
                const updatedFiles = files.map(f => ({ ...f, focus: f.file.path === file.path }));
                return { files: updatedFiles, current: file };
            }

            const newNode: focusIDBNode = { file: file, focus: true };
            const resetFiles: focusIDBNode[] = files.map(f => ({ ...f, focus: false }));
            return { files: [...resetFiles, newNode], current: file };
        }


        case 'UPDATE': {
            
            if (!state) return state;

            const updatedFiles: focusIDBNode[] = state.files.map(f => f.focus ? 
                { ...f, 
                    file: {
                        ...f.file,
                        data: action.data,
                        updatedAt: Date.now()
                }}
                : 
                f
            );
            return {
                files: updatedFiles,
                current: updatedFiles.find(f => f.file.path === state.current?.path)?.file
            };
        }
        
        case 'CLOSE': {
            if (!state) return undefined;

            const newList: focusIDBNode[] = state.files.filter(f => f.file.path !== action.path);
            if (newList.length === 0) return undefined;

            let nextCurrent: IDBNode | undefined = state.current;
            if (state.current?.path === action.path) {
                nextCurrent = newList[newList.length - 1]?.file;
            }
            
            return {
                files: newList.map(f => ({ ...f, focus: f.file.path === nextCurrent?.path })),
                current: nextCurrent
            };
        }

        default: return state;
    }
}