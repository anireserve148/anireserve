"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { sendMessage, getMessages } from "@/app/lib/message-actions"
import { Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface Message {
    id: string
    senderId: string
    content: string
    createdAt: Date
    isRead: boolean
}

interface ChatWindowProps {
    conversationId: string
    currentUserId: string
    recipientName: string
    recipientId: string
    isProRecipient: boolean
}

export function ChatWindow({ conversationId, currentUserId, recipientName, recipientId, isProRecipient }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        loadMessages()
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        setIsLoading(true)
        try {
            const result = await getMessages(conversationId)
            if (result.success && result.data) {
                setMessages(result.data)
            }
        } catch (error) {
            toast.error("Erreur lors du chargement des messages")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!newMessage.trim()) return

        setIsSending(true)
        try {
            const result = await sendMessage({
                recipientId,
                content: newMessage,
                isProRecipient
            })

            if (result.success) {
                setNewMessage("")
                await loadMessages()
            } else {
                toast.error(result.error || "Erreur lors de l'envoi")
            }
        } catch (error) {
            toast.error("Erreur")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b p-4 bg-white">
                <h3 className="font-semibold text-lg text-navy">{recipientName}</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        Aucun message. Commencez la conversation !
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                        ? 'bg-navy text-white'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                    }`}>
                                    <p className="text-sm">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${isOwn ? 'text-gray-300' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="border-t p-4 bg-white">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        disabled={isSending}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isSending || !newMessage.trim()} className="bg-navy hover:bg-navy-light">
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </div>
            </form>
        </div>
    )
}
