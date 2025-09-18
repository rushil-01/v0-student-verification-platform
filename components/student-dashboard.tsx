"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Upload, FileText, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react"
import { AchievementUploadModal } from "@/components/achievement-upload-modal"
import { QueryModal } from "@/components/query-modal"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  institution_id: string
  created_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  date_achieved: string
  document_url: string | null
  verification_status: "pending" | "verified" | "rejected"
  rejection_reason: string | null
  created_at: string
}

interface StudentDashboardProps {
  user: User
  profile: Profile
}

export function StudentDashboard({ user, profile }: StudentDashboardProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>
    }
  }

  const stats = {
    total: achievements.length,
    verified: achievements.filter((a) => a.verification_status === "verified").length,
    pending: achievements.filter((a) => a.verification_status === "pending").length,
    rejected: achievements.filter((a) => a.verification_status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
              <p className="text-slate-600">Welcome back, {profile.full_name}</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Achievements</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Verified</p>
                  <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">My Achievements</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Achievement Records</h2>
              <Button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Achievement
              </Button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading achievements...</p>
              </div>
            ) : achievements.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No achievements yet</h3>
                  <p className="text-slate-600 mb-4">Start by uploading your first achievement for verification.</p>
                  <Button onClick={() => setIsUploadModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Achievement
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(achievement.verification_status)}
                            <h3 className="text-lg font-semibold text-slate-900">{achievement.title}</h3>
                            {getStatusBadge(achievement.verification_status)}
                          </div>
                          <p className="text-slate-600 mb-2">{achievement.description}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span>Category: {achievement.category}</span>
                            <span>Date: {new Date(achievement.date_achieved).toLocaleDateString()}</span>
                          </div>
                          {achievement.verification_status === "rejected" && achievement.rejection_reason && (
                            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-800">
                                <strong>Rejection Reason:</strong> {achievement.rejection_reason}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {achievement.document_url && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(achievement.document_url!, "_blank")}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              View Document
                            </Button>
                          )}
                          {achievement.verification_status === "rejected" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedAchievement(achievement)
                                setIsQueryModalOpen(true)
                              }}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Query
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Your account details and settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Full Name</label>
                    <p className="text-slate-900">{profile.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <p className="text-slate-900">{profile.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Role</label>
                    <p className="text-slate-900 capitalize">{profile.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Member Since</label>
                    <p className="text-slate-900">{new Date(profile.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AchievementUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={fetchAchievements}
        userId={user.id}
      />

      {selectedAchievement && (
        <QueryModal
          isOpen={isQueryModalOpen}
          onClose={() => {
            setIsQueryModalOpen(false)
            setSelectedAchievement(null)
          }}
          achievement={selectedAchievement}
          userId={user.id}
        />
      )}
    </div>
  )
}
