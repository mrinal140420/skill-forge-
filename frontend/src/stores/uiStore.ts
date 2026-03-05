import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  notificationCount: number;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  setDarkMode: (dark: boolean) => void;
  setNotificationCount: (count: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  darkMode: false,
  notificationCount: 0,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (dark) => set({ darkMode: dark }),
  setNotificationCount: (count) => set({ notificationCount: count }),
}));
