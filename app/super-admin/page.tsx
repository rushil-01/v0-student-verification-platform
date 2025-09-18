import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SuperAdminDashboard } from "@/components/super-admin-dashboard"

export default async function SuperAdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user profile and verify super admin role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "super_admin") {
    redirect("/dashboard")
  }

  return <SuperAdminDashboard user={user} profile={profile} />
}
