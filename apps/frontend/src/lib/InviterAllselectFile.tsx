
import type { IDBNode, focusIDBNode, State }           from '@portfolio/shared';

type Action = 
    | { type: 'OPEN'; file: IDBNode}
    | { type: 'UPDATE'; path: string; data: string }
    | { type: 'CLOSE'; path: string };

export default function fileReducer(state: State, action: Action): State {
    switch (action.type) {

        case 'OPEN': {
            
            const alreadyOpen = state.files.find(f => f.file.path === action.file.path);
            if (alreadyOpen) {
                const updatedFiles = state.files.map(f => ({ ...f, focus: f.file.path === action.file.path }));
                return { files: updatedFiles, current: action.file };
            }

            const newNode: focusIDBNode = { file: action.file, focus: true };
            const resetFiles: focusIDBNode[] = state.files.map(f => ({ ...f, focus: false }));
            return { files: [...resetFiles, newNode], current: action.file };
        }

        // case 'CLOSE': {
        //     const newList = state.files.filter(f => f.path !== action.path);
        //     let nextCurrent = state.current;
            
        //     if (state.current?.path === action.path) {
        //         nextCurrent = newList.length > 0 ? { ...newList[newList.length - 1], focus: true } : undefined;
        //     }
            
        //     return {
        //         files: newList.map(f => ({ ...f, focus: f.path === nextCurrent?.path })),
        //         current: nextCurrent
        //     };
        // }

        // case 'UPDATE': {
        //     const updatedFiles = state.files.map(f => 
        //         f.path === action.path ? { ...f, data: action.data, updatedAt: Date.now() } : f
        //     );
        //     return {
        //         files: updatedFiles,
        //         current: updatedFiles.find(f => f.path === action.path)
        //     };
        // }
        
        default: return state;
    }
}