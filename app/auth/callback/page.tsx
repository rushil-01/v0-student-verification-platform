"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")

  useEffect(() => {
    const handleAuthCallback = async () => {
      const supabase = createClient()

      try {
        const code = searchParams.get("code")
        const accessToken = searchParams.get("access_token")
        const refreshToken = searchParams.get("refresh_token")

        let authData
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
          authData = data
        } else if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          if (error) throw error
          authData = data
        } else {
          throw new Error("No valid authentication parameters found")
        }

        if (authData.user) {
          const { error: profileError } = await supabase.from("profiles").upsert(
            {
              id: authData.user.id,
              email: authData.user.email,
              full_name: authData.user.user_metadata.full_name,
              role: authData.user.user_metadata.role,
              institution_id: authData.user.user_metadata.institution_id || null,
            },
            {
              onConflict: "id",
            },
          )

          if (profileError) {
            console.error("Profile creation error:", profileError)
          }

          setStatus("success")

          const role = authData.user.user_metadata.role
          switch (role) {
            case "admin":
              router.replace("/admin")
              break
            case "super_admin":
              router.replace("/super-admin")
              break
            case "recruiter":
              router.replace("/recruiter")
              break
            default:
              router.replace("/dashboard")
          }
        }
      } catch (error) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setTimeout(() => router.replace("/auth/login?error=verification_failed"), 1000)
      }
    }

    handleAuthCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-slate-900">
              {status === "loading" && "Verifying Email..."}
              {status === "success" && "Email Verified!"}
              {status === "error" && "Verification Failed"}
            </CardTitle>
            <CardDescription className="text-slate-600">
              {status === "loading" && "Please wait while we verify your email..."}
              {status === "success" && "Redirecting to your dashboard..."}
              {status === "error" && "Redirecting to login page..."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center">
              {status === "loading" && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              )}
              {status === "success" && (
                <div className="bg-green-100 w-full h-full rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === "error" && (
                <div className="bg-red-100 w-full h-full rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
