"use client"

import { Briefcase, User } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface RoleSwitcherProps {
    currentRole: "CLIENT" | "PRO" | "ADMIN"
    hasProProfile: boolean
}

export function RoleSwitcher({ currentRole, hasProProfile }: RoleSwitcherProps) {
    // Only show if user has both profiles (client + pro)
    if (!hasProProfile || currentRole === "ADMIN") {
        return null
    }

    const isPro = currentRole === "PRO"
    const targetUrl = isPro ? "/dashboard" : "/dashboard/pro"
    const targetRole = isPro ? "Client" : "Pro"

    return (
        <Link href={targetUrl}>
            <Button
                variant="outline"
                size="sm"
                className="border-2 border-primary/20 hover:border-primary/40 bg-primary/5 hover:bg-primary/10 transition-all group"
            >
                {isPro ? (
                    <>
                        <User className="w-4 h-4 mr-2 text-navy" />
                        <span className="text-navy font-bold">Mode {targetRole}</span>
                    </>
                ) : (
                    <>
                        <Briefcase className="w-4 h-4 mr-2 text-orange-600" />
                        <span className="text-orange-600 font-bold">Mode {targetRole}</span>
                    </>
                )}
            </Button>
        </Link>
    )
}
