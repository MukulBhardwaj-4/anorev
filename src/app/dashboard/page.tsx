'use client'

import { RoomCard } from "@/components/RoomCard"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react"
import { api } from "@/utils/ApiClient"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

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
      <div className="w-full px-15 py-10">
        <div className="mb-8 flex w-fit items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm">
          <Switch checked={checked} onCheckedChange={handleToggle} id="accepting-msg" />
          <Label htmlFor="accepting-msg" className="cursor-pointer text-sm font-medium">
            Accepting Messages
          </Label>
        </div>
        {roomData.length === 0 ? (
          <h2 className="text-center  border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            No Rooms yet
          </h2>
        ) : (
          <div className="flex justify-center flex-wrap gap-12">
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
    )
  }
}
