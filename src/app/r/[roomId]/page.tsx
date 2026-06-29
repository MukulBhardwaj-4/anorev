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
import axios from "axios";

type Room = {
    username: string,
    contentUrl: string;
    description: string;
};


export default function page() {
    const roomId = useParams().roomId;
    const [room, setRoom] = useState<Room | null>();
    const [checked, setChecked] = useState(false)
    const [loading, setLoading] = useState(true)
    const [review, setReview] = useState("")
    const [submitted, setSubmitted] = useState(false);
    const [roomFound, setRoomFound] = useState(true)

    useEffect(() => {
        const getStatus = async () => {
            try {
                const response = await axios.get(`/api/r/${roomId}`);
                const roomData = response.data;
                if (!roomData || roomData.message === "Room not found") {
                    setRoomFound(false);
                    return;
                }
                setChecked(!!roomData.isAcceptingMessages);
                setSubmitted(roomData?.hasReviewed)
                setRoom(roomData);
            } catch (error) {
                console.error(error);
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
            const { data } = await axios.post(`/api/r/${roomId}`, {
                textReview: review,
            });

            if (!data) return;

            toast.success("Review submitted successfully");

            setSubmitted(true);
        } catch (error) {
            console.error(error);
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
            <div className="flex justify-center items-center h-screen w-screen">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    The creator is currently not accepting reviews
                </h2>
            </div>
        )
    }
    else if (!roomFound) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Room not found
                </h2>
            </div>
        )
    }
    else if (submitted) {
        return (
            <div className="flex justify-center items-center h-screen w-screen">
                <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
                    Review Submitted successfully
                </h2>
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
                                    <p className="text-xs font-medium uppercase tracking-wide">Creator</p>
                                    <p className="text-sm">{room?.username}</p>
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
