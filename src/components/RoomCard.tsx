import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { useRouter } from "next/navigation"

interface ContentCardProps {
  creatorName: string
  uploadedAt: string
  reviewCount: number
  title: string
  id: string
}

export function RoomCard({
  creatorName,
  uploadedAt,
  reviewCount,
  title,
  id,
}: ContentCardProps) {
  const router = useRouter();
  const handleCheck = () => {
    router.push(`/dashboard/rooms/${id}`)
  }
  return (
    <Card className="group h-full w-full min-h-[200px] flex flex-col overflow-hidden border-border transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex mb-2 flex-wrap items-center justify-between gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="truncate">
            {creatorName} · {new Date(uploadedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </span>
          <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
            <Star className="h-3 w-3 fill-current" />
            {reviewCount}
          </span>
        </div>
        <CardTitle className="text-lg pt-1 line-clamp-2 transition-colors group-hover:text-primary">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter>
        <Button onClick={handleCheck} variant="outline" className="w-full group-hover:border-primary/50 group-hover:bg-primary group-hover:text-primary-foreground">Check</Button>
      </CardFooter>
    </Card>
  )
}