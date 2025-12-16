"use client"

import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutButtonProps {
    variant?: "ghost" | "destructive" | "outline"
    fullWidth?: boolean
    showText?: boolean
}

export function LogoutButton({ variant = "ghost", fullWidth = false, showText = false }: LogoutButtonProps) {
    const handleLogout = async () => {
        await signOut({ callbackUrl: "/" })
    }

    if (fullWidth || showText) {
        return (
            <Button
                variant="outline"
                onClick={handleLogout}
                className={`text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 ${fullWidth ? 'w-full py-3' : ''}`}
            >
                <LogOut className={`w-5 h-5 ${showText ? 'mr-3' : ''}`} />
                {showText && 'Déconnexion'}
            </Button>
        )
    }

    return (
        <Button
            variant={variant}
            size="icon"
            onClick={handleLogout}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
            <LogOut className="w-4 h-4" />
        </Button>
    )
}
