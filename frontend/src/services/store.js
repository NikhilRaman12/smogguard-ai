import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(
    localStorage.getItem('smogguard_user') ||
      '{"name": "Urban Resident", "city": "Delhi", "country": "India", "home_type": "Apartment"}'
  ),
  token: localStorage.getItem('smogguard_token') || 'open-access-token',
  isAuthenticated: true,

  login: (user, token) => {
    localStorage.setItem('smogguard_token', token || 'open-access-token');
    localStorage.setItem('smogguard_user', JSON.stringify(user));
    set({ user, token: token || 'open-access-token', isAuthenticated: true });
  },

  logout: () => {
    // Keep guest session available
    set({
      user: { name: 'Urban Resident', city: 'Delhi', country: 'India' },
      token: 'open-access-token',
      isAuthenticated: true,
    });
  },

  setUser: (user) => {
    localStorage.setItem('smogguard_user', JSON.stringify(user));
    set({ user });
  },
}));

export const useAQIStore = create((set) => ({
  currentAQI: null,
  forecast: null,
  history: null,
  weather: null,
  healthRisk: null,

  setCurrentAQI: (data) => set({ currentAQI: data }),
  setForecast: (data) => set({ forecast: data }),
  setHistory: (data) => set({ history: data }),
  setWeather: (data) => set({ weather: data }),
  setHealthRisk: (data) => set({ healthRisk: data }),
  clearAQI: () => set({ currentAQI: null, forecast: null, history: null, weather: null, healthRisk: null }),
}));

export const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  isTyping: false,

  setConversations: (conversations) => set({ conversations }),

  setActiveConversation: (conversationId) => set({ activeConversation: conversationId }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setIsTyping: (isTyping) => set({ isTyping }),

  clearChat: () => set({ activeConversation: null, messages: [] }),
}));
