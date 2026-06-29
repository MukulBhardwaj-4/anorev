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
    <Card className="w-[320px] h-50 flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex mb-2 items-center justify-between text-xs text-muted-foreground">
          <span>
            {creatorName} - {new Date(uploadedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {reviewCount} reviews
          </span>
        </div>
        <CardTitle className="text-lg pt-1 line-clamp-2">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter>
        <Button onClick={handleCheck} className="w-full">Check</Button>
      </CardFooter>
    </Card>
  )
}
