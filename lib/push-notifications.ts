import { prisma } from "./prisma";

export async function sendPushNotification(userId: string, title: string, body: string, data: any = {}) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { pushToken: true }
        });

        if (!user || !user.pushToken) {
            console.log(`No push token for user ${userId}`);
            return;
        }

        const message = {
            to: user.pushToken,
            sound: 'default',
            title,
            body,
            data,
        };

        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();
        console.log('Push notification sent:', result);
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
