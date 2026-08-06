"use client"

import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { authClient } from "@/lib/auth-client"
import { useDebounceValue } from "usehooks-ts";
import { useEffect, useState } from "react"
import { api } from "@/utils/ApiClient"
import { Loader2 } from "lucide-react"




const formSchema = z.object({
  fullName: z
    .string()
    .nonempty("input field can't be empty")
    .min(5, "full name should be at atleast 5 charcters")
    .max(20, "full name should be at most 20 charcters"),
  email: z
    .string()
    .nonempty("input field can't be empty")
    .email("wrong format email")
    .nonempty("input field can't be empty"),
  password: z
    .string()
    .nonempty("input field can't be empty")
    .min(8, "password should be at atleast 8 charcters")
    .max(20, "password should be at atmost 20 charcters"),
  confirmPassword: z
    .string()
    .nonempty("input field can't be empty"),
})
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });


export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isUnique, setIsUnique] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  })

  const username = form.watch("fullName");
  const [debouncedUsername] = useDebounceValue(username, 600);

const onSubmit = async (formData: z.infer<typeof formSchema>) => {
    if (!isUnique) {
      return
    }
    setLoading(true)
    try {
      const { data, error } = await authClient.signUp.email({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
      })

      if (!data) {
        toast.error(error?.message || "Sign up failed")
        setLoading(false)
        return
      }

      await authClient.sendVerificationEmail({
        email: data.user.email,
        callbackURL: "/verifyEmail",
      })

      toast.success("Account created. Check your email.")
      router.push("/verifyEmail")
    } catch (error: any) {
      toast.error(error?.message || "Error while signing up")
      setLoading(false)
    }
}

useEffect(() => {
    if (!debouncedUsername || username.length < 3) return;

    const checkUsername = async () => {
      setIsChecking(true);

      try {
        const { data } = await api.post("/checkUsername", {
          username: debouncedUsername,
        });

        if (data.available) {
          setUsernameMessage("Username is available");
          setIsUnique(true);
        }
      } catch (err: any) {
        if (err.response?.status === 409) {
          setUsernameMessage("Username already exists");
          setIsUnique(false);
        } else {
          setUsernameMessage("Error checking username");
          setIsUnique(false);
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkUsername();
}, [debouncedUsername]);

    if(loading){
      return(
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background/60 backdrop-blur-sm">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      )
    }

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form noValidate autoComplete="off" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="fullName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input {...field} id="fullName" type="text" placeholder="John Doe" required aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                  {isChecking && username && (
                    <p className="text-sm text-muted-foreground">
                      Checking...
                    </p>
                  )}
                  {!isChecking && username && usernameMessage && (
                    isUnique ? (
                      <p className="text-sm">
                        {usernameMessage}
                      </p>
                    ) : (
                      <p className="text-sm text-red-400">
                        {usernameMessage}
                      </p>
                    )
                  )}
                </Field>
              )}
            />
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input {...field} id="email" type="email" placeholder="m@email.com" required aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Input {...field} id="password" type="password" required aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input {...field} id="confirmPassword" type="password" required aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <FieldGroup>
              <Field>
                <Button type="submit">Create Account</Button>
                <FieldDescription className="px-6 text-center">
                  Already have an account? <a href="/signin">Sign in</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
