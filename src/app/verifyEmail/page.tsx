"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Loader2, RefreshCwIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldLabel,
} from "@/components/ui/field"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp"

const RESEND_COOLDOWN_SECONDS = 120

export default function InputOTPForm() {
  const router = useRouter()
  const session = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [resendCooldown])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const { data, error } = await authClient.emailOtp.verifyEmail({
        email: session.data?.user.email!,
        otp: otpValue,
      });
      if (!error && data.user.emailVerified) {
        toast.success("Email verified")
        router.push("/dashboard")
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to send verification email")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) {
      toast.error(`Please wait ${resendCooldown}s before requesting another code`)
      return
    }
    setLoading(true)
    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: session.data?.user.email!,
        type: "email-verification",
      });
      if (!error) {
        toast.success("Otp sent succesfully")
      }
      router.push("/dashboard");
    } catch (error) {
      console.log(error)
      throw new Error("Error while resending the email")
    }
  }

  const [otpValue, setOtpValue] = useState("")
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Verify your login</CardTitle>
          <CardDescription className="wrap-break-word">
            Enter the verification code we sent to your email address: {session.data?.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button onClick={handleResend} variant="outline" size="xs">
                <RefreshCwIcon />
                Resend Code
              </Button>
            </div>
            <InputOTP onChange={(otpValue) => setOtpValue(otpValue)} maxLength={6} id="otp-verification" required containerClassName="justify-center sm:justify-start">
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-9 *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:h-12 sm:*:data-[slot=input-otp-slot]:w-11 sm:*:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-1 sm:mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-11 *:data-[slot=input-otp-slot]:w-9 *:data-[slot=input-otp-slot]:text-lg sm:*:data-[slot=input-otp-slot]:h-12 sm:*:data-[slot=input-otp-slot]:w-11 sm:*:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>
        </CardContent>
        <CardFooter>
          <Field>
            <Button onClick={handleSubmit} type="submit" className="w-full">
              Verify
            </Button>
          </Field>
        </CardFooter>
      </Card>
    </div>
  )
}
