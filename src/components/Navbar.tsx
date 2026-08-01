"use client"

import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"


export function Navbar() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Sined out successfully")
            router.push("/signin")
          },
          onError: () => {
            toast.error("Failed to sign out")
            setLoading(false)
          },
        },
      })
    } catch (error) {
      setLoading(false)
      toast.error("Failed to sign out")
      console.log(error)
    } finally {
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex sticky z-20 border-b border-border bg-background/85 backdrop-blur-sm flex-col w-full">
      <div className="flex items-center justify-between px-15 py-2">  
        <Link href="/dashboard" className="flex items-center gap-2.5 font-medium">
          <span className="block h-2.5 w-5 rounded-sm bg-foreground" />
          <span className="font-mono text-base tracking-tight">
            ano<span className="text-primary">rev</span>
          </span>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-gray-950 text-white">☰</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Link href={"/dashboard/create"}>Create Room</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
