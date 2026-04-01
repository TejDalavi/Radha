import { create } from 'zustand';

interface StartupState {
  projectId: string | null;
  status: string;
  results: Record<string, any>;
  setProjectInfo: (id: string, state: string) => void;
  updateResults: (status: string, results: Record<string, any>) => void;
  reset: () => void;
}

export const useStartupStore = create<StartupState>((set) => ({
  projectId: null,
  status: 'idle',
  results: {},
  setProjectInfo: (id, status) => set({ projectId: id, status }),
  updateResults: (status, results) => set({ status, results }),
  reset: () => set({ projectId: null, status: 'idle', results: {} }),
}));
