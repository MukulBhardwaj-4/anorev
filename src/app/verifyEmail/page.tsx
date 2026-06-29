"use client"
import { useState } from "react"
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

export default function InputOTPForm() {
  const router = useRouter()
  const session = authClient.useSession()
  const [loading, setLoading] = useState(false)
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
    } finally{
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setLoading(true)
    try {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: session.data?.user.email!,
        type: "email-verification",
      });
      if (!error) {
        toast.success("Otp sent succesfully")
      }
    } catch (error) {
      console.log(error)
      throw new Error("Error while resending the email")
    } finally {
      setLoading(false)
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
    <div className="flex min-h-screen items-center ">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <CardTitle>Verify your login</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address : {session.data?.user.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="otp-verification">
                Verification code
              </FieldLabel>
              <Button onClick={handleResend} variant="outline" size="xs">
                <RefreshCwIcon />
                Resend Code
              </Button>
            </div>
            <InputOTP onChange={(otpValue) => setOtpValue(otpValue)} maxLength={6} id="otp-verification" required>
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="mx-2" />
              <InputOTPGroup className="*:data-[slot=input-otp-slot]:h-12 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:text-xl">
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
