import { auth } from '@/auth';
import { getConversations } from '@/app/lib/message-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatWindow } from '@/components/chat-window';
import { MessageSquare, Inbox } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function MessagesPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    let conversations = [];
    try {
        const result = await getConversations();
        conversations = result.success && result.data ? result.data : [];
    } catch (error) {
        console.error('Error fetching conversations:', error);
        // Fallback to empty array - page will show "Aucune conversation"
    }

    // Get first conversation for display
    const activeConversation = conversations[0];

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
            <main className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <MessageSquare className="h-8 w-8 text-navy" />
                    <h1 className="text-4xl font-bold tracking-tight text-navy font-poppins">Messages</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
                    {/* Conversations List */}
                    <div className="lg:col-span-4">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="text-lg">Conversations</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <Inbox className="h-12 w-12 mb-4" />
                                        <p>Aucune conversation</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {conversations.map((conv: any) => {
                                            const otherUser = session.user.role === 'PRO' ? conv.client : conv.pro.user;
                                            const lastMessage = conv.messages[0];

                                            return (
                                                <div
                                                    key={conv.id}
                                                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold">
                                                            {otherUser.name?.[0]}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-navy truncate">{otherUser.name}</p>
                                                            {lastMessage && (
                                                                <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                                                            )}
                                                        </div>
                                                        {conv.lastMessageAt && (
                                                            <span className="text-xs text-gray-400">
                                                                {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chat Window */}
                    <div className="lg:col-span-8">
                        <Card className="h-full">
                            {activeConversation ? (
                                <ChatWindow
                                    conversationId={activeConversation.id}
                                    currentUserId={session.user.id}
                                    recipientName={
                                        session.user.role === 'PRO'
                                            ? activeConversation.client.name
                                            : activeConversation.pro.user.name
                                    }
                                    recipientId={
                                        session.user.role === 'PRO'
                                            ? activeConversation.clientId
                                            : activeConversation.proId
                                    }
                                    isProRecipient={session.user.role !== 'PRO'}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <div className="text-center">
                                        <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                        <p>Sélectionnez une conversation</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
