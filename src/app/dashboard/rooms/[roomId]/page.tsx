"use client"

import { api } from "@/utils/ApiClient";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Check, ExternalLink, Trash2, Sparkles } from "lucide-react"
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
import { SummarizeModal } from "@/components/SummarizeModal";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";

type Room = {
  creator: any[],
  username: string,
  contentUrl?: string;
  imageUrl?: string;
  imagePublicId?: string;
  videoUrl?: string;
  videoPublicId?: string;
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
  const [summarizeOpen, setSummarizeOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
    if(!room?.username) return;
    const channel = pusherClient.subscribe(`private-${roomId}`);
    channel.bind("new-review", (data: { review: any }) => {
      setReviews((prev: any[]) => [data.review, ...prev]);
    });

    return () => {
      channel.unbind("new-review");
      pusherClient.unsubscribe(`private-${roomId}`);
    };
  }, [roomId]);

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

  const handleSummarize = async () => {
    if (reviews.length === 0) {
      toast.error("No reviews to summarize");
      return;
    }

    setSummarizing(true);
    setSummaryError(null);
    setSummary(null);
    setSummarizeOpen(true);

    try {
      const reviewTexts = reviews.map((review: any) => review.textReview);
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reviews: reviewTexts }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to summarize reviews");
      }

      const data = await response.json();
      setSummary(data.summary);
      toast.success("Summary generated successfully");
    } catch (error: any) {
      setSummaryError(error.message);
      toast.error("Failed to generate summary");
      console.error("Summarization error:", error);
    } finally {
      setSummarizing(false);
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
        <div className="container max-w-4xl mx-auto space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <CardTitle className="text-xl sm:text-2xl">Review Request</CardTitle>
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
              {room?.contentUrl && (
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
              )}

              {(room?.imagePublicId || room?.imageUrl) && (
                <div>
                  <p className="text-s font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Image
                  </p>
                  <div className="rounded-lg overflow-hidden border">
                    {room?.imagePublicId ? (
                      <CldImage
                        src={room.imagePublicId}
                        width={800}
                        height={600}
                        alt="Room image"
                        className="w-full h-auto object-cover max-h-[400px]"
                      />
                    ) : (
                      <img src={room.imageUrl} alt="Room image" className="w-full h-auto object-cover max-h-[400px]" />
                    )}
                  </div>
                </div>
              )}

              {(room?.videoPublicId || room?.videoUrl) && (
                <div>
                  <p className="text-s font-medium text-muted-foreground uppercase tracking-wide mb-1">
                    Video
                  </p>
                  <div className="rounded-lg overflow-hidden border">
                    {room?.videoPublicId ? (
                      <CldVideoPlayer
                        src={room.videoPublicId}
                        width={1920}
                        height={1080}
                        className="w-full h-auto max-h-[400px]"
                      />
                    ) : (
                      <video src={room.videoUrl} controls className="w-full h-auto max-h-[400px]" />
                    )}
                  </div>
                </div>
              )}

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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Reviews</h2>
              {reviews.length > 0 && (
                <Button
                  onClick={handleSummarize}
                  disabled={summarizing}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {summarizing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  Summarize
                </Button>
              )}
            </div>
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

          <SummarizeModal
            open={summarizeOpen}
            onOpenChange={setSummarizeOpen}
            summary={summary}
            loading={summarizing}
            error={summaryError}
          />
        </div>
      </div>
    )
  }
}
