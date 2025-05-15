// 'use client'
// import { useEffect, useState } from 'react'
// import { supabase } from '@/lib/supabase'

// type Message = {
//   id: number
//   content: string
//   created_at: string
// }

// export default function ChatPage() {
//   const [messages, setMessages] = useState<Message[]>([])
//   const [newMessage, setNewMessage] = useState('')

//   useEffect(() => {
//     // โหลดข้อความเริ่มต้น
//     supabase
//       .from('messages')
//       .select('*')
//       .order('created_at', { ascending: true })
//       .then(({ data }) => {
//         if (data) setMessages(data)
//       })

//     // Subscribe แบบ realtime
//     const channel = supabase
//       .channel('messages')
//       .on(
//         'postgres_changes',
//         { event: 'INSERT', schema: 'public', table: 'messages' },
//         (payload) => {
//           setMessages((prev) => [...prev, payload.new as Message])
//         }
//       )
//       .subscribe()

//     return () => {
//       supabase.removeChannel(channel)
//     }
//   }, [])

//   const sendMessage = async () => {
//     if (!newMessage.trim()) return

//     await supabase.from('messages').insert({ content: newMessage })
//     setNewMessage('')
//   }

//   const latestMessage = messages[messages.length - 1]

//   return (
//     <div>
//       <h1>Realtime Chat</h1>
//       <div style={{ maxHeight: 300, overflowY: 'scroll' }}>
//         {latestMessage ? (
//           <p key={latestMessage.id}>{latestMessage.content}</p>
//         ) : (
//           <p>No messages yet</p>
//         )}
//       </div>
//       <input
//         value={newMessage}
//         onChange={(e) => setNewMessage(e.target.value)}
//         placeholder="Type a message"
//       />
//       <button onClick={sendMessage}>Send</button>
//     </div>
//   )
// }
