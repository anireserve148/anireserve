import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const services = await prisma.proService.findMany({
            where: {
                proProfileId: id,
                isActive: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                category: true
            }
        })

        return NextResponse.json({ success: true, services })
    } catch (error) {
        console.error("Error fetching pro services:", error)
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
