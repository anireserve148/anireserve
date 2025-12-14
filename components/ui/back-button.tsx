"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps {
    href?: string
    label?: string
    className?: string
    variant?: "default" | "outline" | "ghost" | "link"
}

export function BackButton({
    href,
    label = "Retour",
    className,
    variant = "ghost"
}: BackButtonProps) {
    const router = useRouter()

    const handleClick = () => {
        if (href) {
            router.push(href)
        } else {
            router.back()
        }
    }

    return (
        <Button
            variant={variant}
            onClick={handleClick}
            className={cn(
                "group gap-2 font-medium transition-all duration-200",
                "hover:gap-3",
                className
            )}
        >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            {label}
        </Button>
    )
}
