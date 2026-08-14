'use client'

import { Input } from "@/components/ui/input"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { api } from "@/utils/ApiClient"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  contentUrl: z
    .string()
    .nonempty("Content Url is required")
    .regex(/^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?$/, "Please enter a valid URL"),
  description: z
    .string()
    .nonempty("Description is required")
    .min(20, "Description must be at least 20 characters")
    .max(500, "Password must be at most 500 characters"),
})

export default function page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentUrl: "",
      description: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { errors } = form.formState

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      await api.post("/rooms", formData)
      toast.success("Room created successfully")
      router.push("/dashboard")

    } catch (error: any) {
      toast.error(error.message)
      setLoading(false)
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
    <div className='flex flex-1 flex-col items-center px-4 py-8 sm:px-8 sm:py-10 lg:px-15'>
      <div>
        <h1 className='text-3xl text-center sm:text-4xl'>Create Room</h1>
      </div>
      <div className="mt-8 flex w-full max-w-xl flex-col sm:mt-10">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
          <Field className="mb-5">
            <FieldLabel className="text-xl" htmlFor="input-badge">Content URL</FieldLabel>
            <Input
              id="input-badge"
              placeholder="https://api.example.com"
              autoComplete="off"
              {...form.register("contentUrl")}
              aria-invalid={!!errors.contentUrl}
            />
            {errors.contentUrl && (
              <p className="text-red-500">{errors.contentUrl.message}</p>
            )}
          </Field>
          <Field className="mb-5">
            <FieldLabel className="text-xl" htmlFor="textarea-disabled">Description</FieldLabel>
            <Textarea
              id="textarea-disabled"
              placeholder="Type your description here."
              maxLength={500}
              aria-invalid={!!errors.description}
              {...form.register("description")}
            />
            {errors.description && (
              <p className="text-red-500">{errors.description.message}</p>
            )}
          </Field>
          <div className="w-full mt-7 flex justify-center">
            <Button type="submit" className="w-50">Submit</Button>
          </div>
        </form>
      </div>
    </div>
  )
}
