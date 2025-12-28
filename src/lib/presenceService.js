// // lib/presenceService.js
// import { connectToConversation, disconnect } from './echoService'
// import { getUser } from './authStorage'

// class PresenceService {
//   constructor() {
//     this.onlineUsers = new Map() // conversationId -> Set<userId>
//     this.callbacks = new Map()
//     this.myUserId = null
//   }

//   /**
//    * Presence + message dinlemeyi başlat
//    */
//   async connectToConversation(conversationId, callbacks = {}) {
//     const user = getUser()
//     if (!user?.id) {
//       console.error('[Presence] User not authenticated')
//       return () => {}
//     }

//     this.myUserId = parseInt(user.id)
//     this.callbacks.set(conversationId, callbacks)

//     if (!this.onlineUsers.has(conversationId)) {
//       this.onlineUsers.set(conversationId, new Set())
//     }

//     console.log('[Presence] Connecting to conversation:', conversationId)

//     await connectToConversation(conversationId)

//     /**
//      * GLOBAL EVENT BUS
//      * echoService içinden window dispatch ile yakalıyoruz
//      */
//     const handler = (e) => {
//       const { event, data } = e.detail || {}

//       // Subscription success → initial presence
//       if (event === 'pusher_internal:subscription_succeeded') {
//         if (data?.presence?.hash) {
//           const users = new Set()

//           Object.values(data.presence.hash).forEach((u) => {
//             const uid = parseInt(u.id || u.user_info?.id)
//             if (uid && uid !== this.myUserId) {
//               users.add(uid)
//             }
//           })

//           this.onlineUsers.set(conversationId, users)

//           callbacks.onUsers?.(users)
//           console.log('[Presence] Initial users:', [...users])
//         }
//       }

//       // User joined
//       if (event === 'pusher_internal:member_added') {
//         const uid = parseInt(data?.user_id || data?.user_info?.id)
//         if (uid && uid !== this.myUserId) {
//           const users = this.onlineUsers.get(conversationId)
//           users?.add(uid)

//           callbacks.onJoin?.(data)
//           callbacks.onUsers?.(users)

//           console.log('[Presence] User joined:', uid)
//         }
//       }

//       // User left
//       if (event === 'pusher_internal:member_removed') {
//         const uid = parseInt(data?.user_id || data?.user_info?.id)
//         if (uid) {
//           const users = this.onlineUsers.get(conversationId)
//           users?.delete(uid)

//           callbacks.onLeave?.(data)
//           callbacks.onUsers?.(users)

//           console.log('[Presence] User left:', uid)
//         }
//       }

//       // Message
//       if (event === 'message.sent') {
//         callbacks.onMessage?.(data)
//       }
//     }

//     window.addEventListener('ws-event', handler)

//     // cleanup
//     return () => {
//       window.removeEventListener('ws-event', handler)
//       this.leaveConversation(conversationId)
//     }
//   }

//   /**
//    * Konuşmadan ayrıl
//    */
//   leaveConversation(conversationId) {
//     console.log('[Presence] Leaving conversation:', conversationId)

//     this.onlineUsers.delete(conversationId)
//     this.callbacks.delete(conversationId)

//     if (this.callbacks.size === 0) {
//       disconnect()
//     }
//   }

//   /**
//    * Kullanıcı online mı
//    */
//   isUserOnline(conversationId, userId) {
//     return this.onlineUsers.get(conversationId)?.has(parseInt(userId)) ?? false
//   }

//   /**
//    * Online kullanıcıları getir
//    */
//   getOnlineUsers(conversationId) {
//     return this.onlineUsers.get(conversationId) || new Set()
//   }

//   /**
//    * Hepsini kapat
//    */
//   disconnectAll() {
//     console.log('[Presence] Disconnect all')

//     this.onlineUsers.clear()
//     this.callbacks.clear()
//     disconnect()
//   }
// }

// export const presenceService = new PresenceService()
