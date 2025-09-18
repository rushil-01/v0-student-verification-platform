"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, XCircle, Clock, FileText, Search, Eye, MessageSquare, UserIcon, Calendar } from "lucide-react"
import { AchievementReviewModal } from "@/components/achievement-review-modal"
import { QueryResponseModal } from "@/components/query-response-modal"
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
  student: {
    full_name: string
    email: string
  }
}

interface Query {
  id: string
  query_text: string
  status: "open" | "in_progress" | "resolved"
  admin_response: string | null
  created_at: string
  achievement: {
    title: string
    student: {
      full_name: string
      email: string
    }
  }
}

interface AdminDashboardProps {
  user: User
  profile: Profile
}

export function AdminDashboard({ user, profile }: AdminDashboardProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [queries, setQueries] = useState<Query[]>([])
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const supabase = createClient()

  useEffect(() => {
    fetchAchievements()
    fetchQueries()
  }, [])

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select(
          `
          *,
          student:profiles!achievements_student_id_fkey(full_name, email)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from("queries")
        .select(
          `
          *,
          achievement:achievements(
            title,
            student:profiles!achievements_student_id_fkey(full_name, email)
          )
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setQueries(data || [])
    } catch (error) {
      console.error("Error fetching queries:", error)
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

  const getQueryStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Open</Badge>
    }
  }

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.student.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || achievement.verification_status === statusFilter
    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  const stats = {
    total: achievements.length,
    pending: achievements.filter((a) => a.verification_status === "pending").length,
    verified: achievements.filter((a) => a.verification_status === "verified").length,
    rejected: achievements.filter((a) => a.verification_status === "rejected").length,
    openQueries: queries.filter((q) => q.status === "open").length,
  }

  const categories = [
    "Academic Excellence",
    "Research & Publications",
    "Leadership & Service",
    "Sports & Athletics",
    "Arts & Culture",
    "Technical Skills",
    "Internships & Work Experience",
    "Competitions & Awards",
    "Community Service",
    "Other",
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
              <p className="text-slate-600">Achievement Verification Management</p>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Submissions</p>
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
                  <p className="text-sm font-medium text-slate-600">Pending Review</p>
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
                  <p className="text-sm font-medium text-slate-600">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Open Queries</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.openQueries}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="achievements" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="achievements">Achievement Reviews</TabsTrigger>
            <TabsTrigger value="queries">Student Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="achievements" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search by title, student name, or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="verified">Verified</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Achievement List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading achievements...</p>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No achievements found</h3>
                  <p className="text-slate-600">No achievements match your current filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredAchievements.map((achievement) => (
                  <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusIcon(achievement.verification_status)}
                            <h3 className="text-lg font-semibold text-slate-900">{achievement.title}</h3>
                            {getStatusBadge(achievement.verification_status)}
                          </div>
                          <p className="text-slate-600 mb-3">{achievement.description}</p>
                          <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{achievement.student.full_name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
                            </div>
                            <span>Category: {achievement.category}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Submitted: {new Date(achievement.created_at).toLocaleDateString()}
                          </p>
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAchievement(achievement)
                              setIsReviewModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="queries" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Student Queries</h2>
            </div>

            {queries.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No queries yet</h3>
                  <p className="text-slate-600">Student queries will appear here when submitted.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {queries.map((query) => (
                  <Card key={query.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <MessageSquare className="w-4 h-4 text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">
                              Query about "{query.achievement.title}"
                            </h3>
                            {getQueryStatusBadge(query.status)}
                          </div>
                          <p className="text-slate-600 mb-3">{query.query_text}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                            <div className="flex items-center gap-1">
                              <UserIcon className="w-4 h-4" />
                              <span>{query.achievement.student.full_name}</span>
                            </div>
                            <span>Submitted: {new Date(query.created_at).toLocaleDateString()}</span>
                          </div>
                          {query.admin_response && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-sm text-blue-800">
                                <strong>Admin Response:</strong> {query.admin_response}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedQuery(query)
                              setIsQueryModalOpen(true)
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            {query.status === "open" ? "Respond" : "View Response"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {selectedAchievement && (
        <AchievementReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false)
            setSelectedAchievement(null)
          }}
          achievement={selectedAchievement}
          onSuccess={() => {
            fetchAchievements()
            setIsReviewModalOpen(false)
            setSelectedAchievement(null)
          }}
          adminId={user.id}
        />
      )}

      {selectedQuery && (
        <QueryResponseModal
          isOpen={isQueryModalOpen}
          onClose={() => {
            setIsQueryModalOpen(false)
            setSelectedQuery(null)
          }}
          query={selectedQuery}
          onSuccess={() => {
            fetchQueries()
            setIsQueryModalOpen(false)
            setSelectedQuery(null)
          }}
          adminId={user.id}
        />
      )}
    </div>
  )
}
