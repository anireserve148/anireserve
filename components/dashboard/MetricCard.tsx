import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, ArrowDown } from "lucide-react"

interface MetricCardProps {
    label: string
    value: string
    changeLabel?: string
    changeValue?: string
    progress?: number // 0 to 1
    accent?: "default" | "orange" | "green" | "red"
}

export function MetricCard({
    label,
    value,
    changeLabel,
    changeValue,
    progress,
    accent = "default"
}: MetricCardProps) {
    const isPositiveChange = changeValue?.startsWith("+")

    const accentColors = {
        default: "text-primary",
        orange: "text-orange-500",
        green: "text-green-500",
        red: "text-red-500"
    }

    const progressColors = {
        default: "bg-primary",
        orange: "bg-orange-500",
        green: "bg-green-500",
        red: "bg-red-500"
    }

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {label}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Value */}
                <div className={`text-3xl font-bold ${accentColors[accent]}`}>
                    {value}
                </div>

                {/* Change Indicator */}
                {changeLabel && changeValue && (
                    <div className="flex items-center gap-2 text-sm">
                        {isPositiveChange ? (
                            <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : (
                            <ArrowDown className="w-4 h-4 text-red-500" />
                        )}
                        <span className={isPositiveChange ? "text-green-600" : "text-red-600"}>
                            {changeValue}
                        </span>
                        <span className="text-muted-foreground">{changeLabel}</span>
                    </div>
                )}

                {/* Progress Bar */}
                {progress !== undefined && (
                    <div className="space-y-1">
                        <Progress
                            value={progress * 100}
                            className="h-2"
                            indicatorClassName={progressColors[accent]}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
