type State = {
    files: FocusIDBNode[];
    current: FocusIDBNode | undefined;
};

type Action = 
    | { type: 'OPEN_FILE'; file: IDBNode }
    | { type: 'CLOSE_FILE'; path: string }
    | { type: 'UPDATE_CONTENT'; path: string; data: string };

function fileReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'OPEN_FILE': {
            const alreadyOpen = state.files.find(f => f.path === action.file.path);
            if (alreadyOpen) {
                const updatedFiles = state.files.map(f => ({ ...f, focus: f.path === action.file.path }));
                return { files: updatedFiles, current: updatedFiles.find(f => f.focus) };
            }
            const newNode = { ...action.file, focus: true };
            const resetFiles = state.files.map(f => ({ ...f, focus: false }));
            return { files: [...resetFiles, newNode], current: newNode };
        }

        case 'CLOSE_FILE': {
            const newList = state.files.filter(f => f.path !== action.path);
            let nextCurrent = state.current;
            
            if (state.current?.path === action.path) {
                nextCurrent = newList.length > 0 ? { ...newList[newList.length - 1], focus: true } : undefined;
            }
            
            return {
                files: newList.map(f => ({ ...f, focus: f.path === nextCurrent?.path })),
                current: nextCurrent
            };
        }

        case 'UPDATE_CONTENT': {
            const updatedFiles = state.files.map(f => 
                f.path === action.path ? { ...f, data: action.data, updatedAt: Date.now() } : f
            );
            return {
                files: updatedFiles,
                current: updatedFiles.find(f => f.path === action.path)
            };
        }
        
        default: return state;
    }
}