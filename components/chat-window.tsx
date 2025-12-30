"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { sendMessage, getMessages, uploadChatImage } from "@/app/lib/message-actions"
import { Send, Loader2, Check, CheckCheck, Image as ImageIcon, Plus, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Message {
    id: string
    senderId: string
    content: string
    imageUrl?: string | null
    type: 'TEXT' | 'IMAGE'
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        loadMessages()
        const interval = setInterval(loadMessages, 5000)
        return () => clearInterval(interval)
    }, [conversationId])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadMessages = async () => {
        if (messages.length === 0) setIsLoading(true)
        try {
            const result = await getMessages(conversationId)
            if (result.success && result.data) {
                setMessages(result.data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error("L'image est trop volumineuse (max 2Mo)")
            return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
            setSelectedImage(reader.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() && !selectedImage) return

        setIsSending(true)
        try {
            let imageUrl = null
            if (selectedImage) {
                const uploadResult = await uploadChatImage(selectedImage)
                if (uploadResult.success) {
                    imageUrl = uploadResult.data
                } else {
                    toast.error("Erreur lors de l'upload")
                    setIsSending(false)
                    return
                }
            }

            const result = await sendMessage({
                recipientId,
                content: newMessage,
                imageUrl: imageUrl || undefined,
                type: imageUrl ? 'IMAGE' : 'TEXT',
                isProRecipient
            })

            if (result.success) {
                setNewMessage("")
                setSelectedImage(null)
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
        <div className="flex flex-col h-full bg-[#E5DDD5] dark:bg-navy-900 border rounded-xl overflow-hidden shadow-xl">
            {/* Header */}
            <div className="border-b p-4 bg-white dark:bg-navy-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                    {recipientName.charAt(0)}
                </div>
                <div>
                    <h3 className="font-bold text-navy dark:text-white leading-tight">{recipientName}</h3>
                    <p className="text-xs text-emerald-500 font-medium italic">En ligne</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <span className="bg-white/50 dark:bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-gray-500">
                            Commencez à discuter avec {recipientName}
                        </span>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwn = msg.senderId === currentUserId
                        return (
                            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow-sm ${isOwn
                                    ? 'bg-[#DCF8C6] dark:bg-primary/20 rounded-tr-none'
                                    : 'bg-white dark:bg-navy-800 rounded-tl-none'
                                    }`}>

                                    {msg.type === 'IMAGE' && msg.imageUrl && (
                                        <div className="mb-2 rounded-lg overflow-hidden relative aspect-auto min-w-[200px] max-h-[300px]">
                                            <img src={msg.imageUrl} alt="Chat" className="w-full h-auto object-contain rounded-lg" />
                                        </div>
                                    )}

                                    {msg.content && (
                                        <p className="text-[15px] text-gray-800 dark:text-gray-100 whitespace-pre-wrap">{msg.content}</p>
                                    )}

                                    <div className="flex items-center justify-end gap-1 mt-1">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                            {formatTime(msg.createdAt)}
                                        </span>
                                        {isOwn && (
                                            msg.isRead
                                                ? <CheckCheck className="w-3 h-3 text-sky-500" />
                                                : <Check className="w-3 h-3 text-gray-400" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Selected Image Preview */}
            {selectedImage && (
                <div className="p-4 bg-white dark:bg-navy-800 border-t relative">
                    <Button
                        onClick={() => setSelectedImage(null)}
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full bg-black/50 text-white hover:bg-black/70"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                        <Image src={selectedImage} alt="Preview" fill className="object-cover" />
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-[#F0F2F5] dark:bg-navy-800 p-3">
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept="image/*"
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-500 hover:text-primary shrink-0"
                    >
                        <Plus className="w-6 h-6" />
                    </Button>
                    <div className="flex-1 bg-white dark:bg-navy-700 rounded-full px-4 border border-gray-200 dark:border-navy-600 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Écrivez votre message..."
                            disabled={isSending}
                            className="border-none bg-transparent focus-visible:ring-0 px-0 h-10"
                        />
                    </div>
                    {(newMessage.trim() || selectedImage) ? (
                        <Button
                            type="submit"
                            disabled={isSending}
                            className="bg-primary hover:bg-primary/90 text-white rounded-full w-10 h-10 p-0 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                        >
                            {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5 pl-0.5" />}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-gray-500 hover:text-primary shrink-0"
                        >
                            <ImageIcon className="w-6 h-6" />
                        </Button>
                    )}
                </form>
            </div>
        </div>
    )
}

function formatTime(date: Date) {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}
