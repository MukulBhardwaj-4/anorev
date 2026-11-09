"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLink, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/ApiClient";
import { CldImage, CldVideoPlayer } from "next-cloudinary";
import "next-cloudinary/dist/cld-video-player.css";
import { pusherClient } from "@/lib/pusherClient";
import Review from "@/components/Review";

type Room = {
    username: string,
    contentUrl?: string;
    imageUrl?: string;
    imagePublicId?: string;
    videoUrl?: string;
    videoPublicId?: string;
    description: string;
};


export default function page() {
    const roomId = useParams().roomId;
    const [room, setRoom] = useState<Room | null>();
    const [checked, setChecked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [review, setReview] = useState("")
    const [submitted, setSubmitted] = useState(false);
    const [roomFound, setRoomFound] = useState(true);
    const [reviews, setReviews] = useState<any[]>([])

    useEffect(() => {
        const getStatus = async () => {
            try {
                const { data: roomData } = await api.get(`/r/${roomId}`);
                setChecked(!!roomData.isAcceptingMessages);
                setSubmitted(!!roomData.hasReviewed)
                setRoom(roomData);
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setRoomFound(false);
                } else {
                    toast.error(error.message);
                }
            }
            finally {
                setLoading(false)
            }
        };
        getStatus();
    }, [])

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await api.post(`/r/${roomId}`, { textReview: review });
            toast.success("Review submitted successfully");
            setSubmitted(true);
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
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
    else if (!checked) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center px-4 text-center">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl">
                    The creator is currently not accepting reviews
                </h2>
            </div>
        )
    }
    else if (!roomFound) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center px-4 text-center">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl">
                    Room not found
                </h2>
            </div>
        )
    }
    else if (submitted) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center px-4 text-center">
                <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0 sm:text-3xl">
                    Review already submitted
                </h2>
            </div>
        )
    }
    else {
        return (
            <div>
                <div className="container max-w-4xl mx-auto space-y-8 px-4 py-8 sm:space-y-10 sm:px-6 sm:py-10">
                {reviews.length > 0 && (
                    <>
                        <Separator />
                        <section className="space-y-6">
                            <h2 className="text-2xl font-semibold">Reviews</h2>
                            <div className="space-y-4">
                                {reviews.map((review, index) => (
                                    <Review key={review.ipHash ?? index} review={review.textReview} />
                                ))}
                            </div>
                        </section>
                    </>
                )}
                <Card>
                        <CardHeader>
                            <div className="flex flex-wrap items-start justify-between gap-4">
                                <CardTitle className="text-xl sm:text-2xl">Review Request</CardTitle>
                                <div className="text-right opacity-60">
                                    <p className="text-xs font-medium uppercase tracking-wide">Creator</p>
                                    <p className="text-sm">{room?.username}</p>
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
                        </CardContent>
                    </Card>
                    <Separator />
                    <section className="space-y-6">
                        <Field>
                            <FieldLabel htmlFor="textarea-message">Review</FieldLabel>
                            <FieldDescription>Enter your Review below.</FieldDescription>
                            <Textarea
                                maxLength={500}
                                value={review}
                                onChange={(event) => setReview(event.target.value)}
                                id="textarea-message"
                                placeholder="Type your message here."
                            />
                        </Field>
                        <div className="flex justify-center items-center">
                            <Button onClick={handleSubmit}>Submit</Button>
                        </div>
                    </section>
                </div>
            </div>
        )
    }
}
