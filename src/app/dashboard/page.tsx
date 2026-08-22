'use client'

import { RoomCard } from "@/components/RoomCard"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/utils/ApiClient"
import { Loader2, Inbox, Plus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

interface RoomData {
  username: string;
  uploadedAt: string;
  reviewCount: number;
  title: string;
  id: string;
}

export default function Page() {
  const [checked, setChecked] = useState(false);
  const [roomData, setRoomData] = useState<RoomData[]>([])
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getStatus = async () => {
      try {
        const { data } = await api.get("/accept-message");
        setChecked(data ?? false);
      } catch (error) {
        console.error(error);
      }
    };
    getStatus();
  }, []);

  useEffect(() => {
    const getRoomData = async () => {
      try {
        const { data } = await api.get("/rooms");
        setRoomData(data);
      } catch (error) {
        console.error(error);
      }
      finally {
        setLoading(false);
      }
    }
    getRoomData()
  }, [])

  const handleToggle = async (value: boolean) => {
    setChecked(value);
    try {
      await api.patch("/accept-message", { msgStatus: value });
    } catch (error: any) {
      toast.error(error.message);
      setChecked(!value);
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
      <div className="w-full px-4 py-8 sm:px-8 sm:py-10 lg:px-15">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Your rooms
              </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {roomData.length > 0 && (
                <Button asChild variant="outline">
                  <Link href="/dashboard/create">
                    <Plus className="h-4 w-4" />
                    Create a room
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 shadow-sm">
                <Switch checked={checked} onCheckedChange={handleToggle} id="accepting-msg" />
                <Label htmlFor="accepting-msg" className="cursor-pointer text-sm font-medium">
                  Accepting messages
                </Label>
              </div>
            </div>
          </div>

          {roomData.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/50 px-6 py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Inbox className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-semibold tracking-tight">
                No rooms yet
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
                Create your first room and share the link to start collecting honest, anonymous feedback.
              </p>
              <Button asChild className="mt-6">
                <Link href="/dashboard/create">
                  <Plus className="h-4 w-4" />
                  Create a room
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4">
              {roomData.map((room) => (
                <RoomCard
                  key={room.id}
                  creatorName={room.username}
                  uploadedAt={room.uploadedAt}
                  reviewCount={room.reviewCount}
                  title={room.title}
                  id={room.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
}
