import { auth } from '@/auth';
import { getConversations } from '@/app/lib/message-actions';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChatWindow } from '@/components/chat-window';
import { MessageSquare, Inbox } from 'lucide-react';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface PageProps {
    searchParams: Promise<{ proId?: string }>
}

export default async function MessagesPage({ searchParams }: PageProps) {
    const session = await auth();
    const params = await searchParams;

    if (!session?.user?.id) {
        redirect('/login');
    }

    // If proId is provided, create/find conversation first
    let targetConversationId: string | null = null;
    if (params.proId) {
        // Find or create conversation with this pro
        let conversation = await prisma.conversation.findUnique({
            where: {
                clientId_proId: {
                    clientId: session.user.id,
                    proId: params.proId
                }
            },
            include: {
                client: true,
                pro: { include: { user: true } },
            }
        });

        if (!conversation) {
            await prisma.conversation.create({
                data: {
                    clientId: session.user.id,
                    proId: params.proId,
                    lastMessageAt: new Date()
                }
            });

            // Reload with relations
            conversation = await prisma.conversation.findUnique({
                where: {
                    clientId_proId: {
                        clientId: session.user.id,
                        proId: params.proId
                    }
                },
                include: {
                    client: true,
                    pro: { include: { user: true } },
                }
            });
        }

        targetConversationId = conversation?.id || null;
    }

    let conversations: any[] = [];
    try {
        const result = await getConversations();
        conversations = result.success && result.data ? result.data : [];
    } catch (error) {
        console.error('Error fetching conversations:', error);
    }

    // Use target conversation or first in list
    const activeConversation = targetConversationId
        ? conversations.find(c => c.id === targetConversationId) || conversations[0]
        : conversations[0];

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
                            <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-320px)]">
                                {conversations.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                                        <Inbox className="h-12 w-12 mb-4" />
                                        <p>Aucune conversation</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {conversations.map((conv: any) => {
                                            const otherUser = session.user.role === 'PRO' ? conv.client : conv.pro?.user;
                                            const lastMessage = conv.messages?.[0];
                                            const isActive = activeConversation?.id === conv.id;

                                            return (
                                                <Link
                                                    key={conv.id}
                                                    href={`/dashboard/messages?convId=${conv.id}`}
                                                    className={`block p-4 hover:bg-gray-50 cursor-pointer transition-colors ${isActive ? 'bg-navy/5 border-l-4 border-navy' : ''}`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-navy/10 flex items-center justify-center text-navy font-bold flex-shrink-0">
                                                            {otherUser?.name?.[0] || '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-navy truncate">{otherUser?.name || 'Utilisateur'}</p>
                                                            {lastMessage && (
                                                                <p className="text-sm text-gray-500 truncate">{lastMessage.content}</p>
                                                            )}
                                                        </div>
                                                        {conv.lastMessageAt && (
                                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                                {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </Link>
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
                                            ? activeConversation.client?.name || 'Client'
                                            : activeConversation.pro?.user?.name || 'Professionnel'
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
                                        <p className="text-sm mt-2">ou contactez un professionnel depuis sa page</p>
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
