import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { StudentDashboard } from "@/components/student-dashboard"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile) {
    redirect("/auth/login")
  }

  // Redirect based on role
  if (profile.role === "admin") {
    redirect("/admin")
  } else if (profile.role === "super_admin") {
    redirect("/super-admin")
  } else if (profile.role === "recruiter") {
    redirect("/recruiter")
  }

  return <StudentDashboard user={user} profile={profile} />
}
