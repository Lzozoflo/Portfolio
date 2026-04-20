import { create } from "zustand";

type KeyboardStore = {
    isOpen: boolean;
    open: () => void;
    close: () => void;
};

export const useKeyboardStore = create<KeyboardStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
}));