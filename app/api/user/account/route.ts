import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password) {
            return NextResponse.json({ error: 'Password required' }, { status: 400 });
        }

        // Verify password
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, password: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If user has a password (not OAuth-only account)
        if (user.password) {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
            }
        }

        // Delete user account (CASCADE will handle related data)
        await prisma.user.delete({
            where: { id: session.user.id }
        });

        return NextResponse.json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        return NextResponse.json({
            error: 'Failed to delete account',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
