import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecruiterDashboard } from "@/components/recruiter-dashboard"

export default async function RecruiterPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and verify recruiter role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "recruiter") {
    redirect("/dashboard")
  }

  return <RecruiterDashboard user={user} profile={profile} />
}
