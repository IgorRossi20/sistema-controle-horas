import { defineStore } from 'pinia'
import { defaultUser } from '../config/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: defaultUser
  }),
  
  getters: {
    userId: (state) => state.user.uid,
    userEmail: (state) => state.user.email,
    userName: (state) => state.user.displayName
  },
  
  persist: {
    key: 'user-store',
    storage: localStorage
  }
})