import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

interface ReviewProps {
    review: string;
}

export default function Review({ review }: ReviewProps) {
    return (
        <Card className="border-muted-foreground/10 shadow-sm">
            <CardContent className="flex gap-3 p-5">
                <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                <p className="text-sm leading-relaxed text-foreground/90">
                    {review}
                </p>
            </CardContent>
        </Card>
    );
}