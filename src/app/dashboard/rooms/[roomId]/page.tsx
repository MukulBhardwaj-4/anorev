"use client"

import { api } from "@/utils/ApiClient";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Check, ExternalLink, Trash2 } from "lucide-react"
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Review from "@/components/Review"
import { toast } from "sonner";
import { pusherClient } from "@/lib/pusherClient";
import { IReview } from "@/models/review.model";

type Room = {
  creator: any[],
  username: string,
  contentUrl: string;
  description: string;
  reviews: any[];
};

export default function Page() {
  const [room, setRoom] = useState<Room | null>();
  const roomId = useParams<{ roomId: string }>().roomId;
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [roomUrl, setRoomUrl] = useState("")

  const router = useRouter()

  useEffect(() => {
    const getRoom = async () => {
      if (!roomId) {
        console.error("No room id");
        setLoading(false);
        return
      }
      try {
        const { data } = await api.get(`/rooms/${roomId}`);
        setRoom(data);
        setReviews(data.reviews)
        setRoomUrl(`${window.location.origin}/r/${roomId}`)
      } catch (error: any) {
        toast.error(error.message);
      }
      finally {
        setLoading(false)
      }
    };

    getRoom();
  }, [roomId])

  useEffect(() => {
    if (!roomId) return;

    const channel = pusherClient.subscribe(`private-${roomId}`);
    channel.bind("new-review", (data: { review: any }) => {
      setReviews((prev: any[]) => [data.review, ...prev]);
    });

    return () => {
      channel.unbind("new-review");
      pusherClient.unsubscribe(`private-${roomId}`);
    };
  }, [room?.username]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteRoom = async () => {
    try {
      await api.delete(`/rooms/${roomId}`);
      toast.success("Room deleted successfully")
      router.replace("/dashboard")
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }
  else {
    return (
      <div>
        <div className="container max-w-4xl mx-auto py-10 space-y-10">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-2xl">Review Request</CardTitle>
                <div className="text-right opacity-60">
                  <Button
                    onClick={handleDeleteRoom}
                    variant={"destructive"}
                    size="sm"
                    className="mb-2  h-7 text-destructive  hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-s font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Content URL
                </p>
                <a
                  href={room?.contentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-400 hover:underline font-medium break-all"
                >
                  {room?.contentUrl}
                  <ExternalLink className="h-4 w-4 shrink-0" />
                </a>
              </div>
              <div>
                <p className="text-s font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Description
                </p>
                <p className="text-sm leading-relaxed">
                  {room?.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Creator</p>
                <p className="text-sm">{room?.username}</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={roomUrl}
                  readOnly
                  onChange={() => { }}
                  className="font-mono text-sm bg-muted cursor-default"
                />
                <Button onClick={handleCopy} variant="outline" size="icon" aria-label="Copy room link">
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
          <Separator />
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold">Reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((review: any, index: number) => (
                  <Review key={review.ipHash ?? index} review={review.textReview} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    )
  }
}