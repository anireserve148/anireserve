import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, ArrowLeft, Users, Calendar } from 'lucide-react';
import Link from 'next/link';

export default async function AdminConversationsPage() {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        redirect('/');
    }

    // Fetch all conversations with details
    const conversations = await prisma.conversation.findMany({
        include: {
            client: true,
            pro: {
                include: { user: true }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            },
            _count: {
                select: { messages: true }
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20 pt-24">
            <main className="container mx-auto px-4 max-w-7xl">
                <div className="flex items-center gap-3 mb-8">
                    <Link href="/dashboard/admin">
                        <Button variant="ghost" size="icon" className="mr-2">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <MessageSquare className="h-8 w-8 text-navy" />
                    <h1 className="text-4xl font-bold tracking-tight text-navy font-poppins">
                        Conversations
                    </h1>
                    <span className="ml-4 bg-navy text-white px-3 py-1 rounded-full text-sm">
                        {conversations.length} total
                    </span>
                </div>

                {conversations.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center text-gray-500">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Aucune conversation sur la plateforme</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {conversations.map(conv => {
                            const lastMessage = conv.messages[0];

                            return (
                                <Card key={conv.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-4">
                                                <div className="flex -space-x-3">
                                                    <div className="h-12 w-12 rounded-full bg-turquoise/20 flex items-center justify-center text-turquoise font-bold border-2 border-white">
                                                        {conv.client?.name?.[0] || 'C'}
                                                    </div>
                                                    <div className="h-12 w-12 rounded-full bg-navy/20 flex items-center justify-center text-navy font-bold border-2 border-white">
                                                        {conv.pro?.user?.name?.[0] || 'P'}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-semibold text-navy">
                                                            {conv.client?.name || 'Client inconnu'}
                                                        </span>
                                                        <span className="text-gray-400">↔</span>
                                                        <span className="font-semibold text-navy">
                                                            {conv.pro?.user?.name || 'Pro inconnu'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            <Users className="h-3 w-3" />
                                                            {conv._count.messages} messages
                                                        </span>
                                                        {conv.lastMessageAt && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {new Date(conv.lastMessageAt).toLocaleDateString('fr-FR', {
                                                                    day: '2-digit',
                                                                    month: 'short',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {lastMessage && (
                                                        <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                                            <span className="font-medium">Dernier message:</span>{' '}
                                                            {lastMessage.content.substring(0, 100)}
                                                            {lastMessage.content.length > 100 && '...'}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs text-gray-400">ID: {conv.id.slice(0, 8)}...</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
