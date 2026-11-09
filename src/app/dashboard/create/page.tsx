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
import { CldUploadWidget } from "next-cloudinary"

const formSchema = z.object({
  contentUrl: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\/(?:www\.)?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+(?:\/[^\s]*)?$/.test(val), "Please enter a valid URL"),
  description: z
    .string()
    .nonempty("Description is required")
    .min(20, "Description must be at least 20 characters")
    .max(500, "Description must be at most 500 characters"),
  image: z.any().optional(),
  video: z.any().optional(),
})

type UploadResult = {
  url: string
  publicId: string
}

export default function page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState<UploadResult | null>(null)
  const [video, setVideo] = useState<UploadResult | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contentUrl: "",
      description: "",
      image: "",
      video: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const { errors } = form.formState

  const handleUploadSuccess = (
    setter: (r: UploadResult) => void,
    result: any
  ) => {
    const info = result.info
    if (typeof info === 'string' || !info?.secure_url || !info?.public_id) {
      toast.error("Upload succeeded but response was invalid")
      return
    }
    setter({ url: info.secure_url, publicId: info.public_id })
  }

  const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    setLoading(true)
    try {
      await api.post("/rooms", {
        contentUrl: formData.contentUrl || undefined,
        description: formData.description,
        imageUrl: image?.url,
        imagePublicId: image?.publicId,
        videoUrl: video?.url,
        videoPublicId: video?.publicId,
      })
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
            <FieldLabel className="text-xl" htmlFor="input-badge">Content URL (Optional)</FieldLabel>
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
            <FieldLabel className="text-xl" htmlFor="input-image">Upload Image (Optional)</FieldLabel>
            <CldUploadWidget
              uploadPreset="ml_default"
              options={{
                folder: "anorev/images",
                resourceType: "image",
                maxFileSize: 10 * 1024 * 1024,
              }}
              onSuccess={(result: any) => handleUploadSuccess(setImage, result)}
              onError={(error: any) => toast.error(error?.message || "Upload failed")}
            >
              {({ open }) => (
                <Button type="button" variant="outline" onClick={() => open?.()}>
                  {image ? `Uploaded: ${image.publicId}` : "Upload Image"}
                </Button>
              )}
            </CldUploadWidget>
          </Field>

          <Field className="mb-5">
            <FieldLabel className="text-xl" htmlFor="input-video">Upload Video (Optional)</FieldLabel>
            <CldUploadWidget
              uploadPreset="ml_default"
              options={{
                folder: "anorev/videos",
                resourceType: "video",
                maxFileSize: 100 * 1024 * 1024,
              }}
              onSuccess={(result: any) => handleUploadSuccess(setVideo, result)}
              onError={(error: any) => toast.error(error?.message || "Upload failed")}
            >
              {({ open }) => (
                <Button type="button" variant="outline" onClick={() => open?.()}>
                  {video ? `Uploaded: ${video.publicId}` : "Upload Video"}
                </Button>
              )}
            </CldUploadWidget>
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