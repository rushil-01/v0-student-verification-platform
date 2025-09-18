"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  FileText,
  UserIcon,
  Calendar,
  Building2,
  CheckCircle,
  Star,
  Eye,
  Mail,
  BookmarkPlus,
  Bookmark,
} from "lucide-react"
import { StudentProfileModal } from "@/components/student-profile-modal"
import { ContactStudentModal } from "@/components/contact-student-modal"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  date_achieved: string
  document_url: string | null
  verification_status: "verified"
  created_at: string
  student: {
    id: string
    full_name: string
    email: string
    institution?: {
      name: string
    }
  }
}

interface SavedCandidate {
  id: string
  student_id: string
  notes: string
  created_at: string
  student: {
    full_name: string
    email: string
    institution?: {
      name: string
    }
  }
}

interface RecruiterDashboardProps {
  user: SupabaseUser
  profile: Profile
}

export function RecruiterDashboard({ user, profile }: RecruiterDashboardProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [savedCandidates, setSavedCandidates] = useState<SavedCandidate[]>([])
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedStudentForContact, setSelectedStudentForContact] = useState<any>(null)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [institutionFilter, setInstitutionFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")
  const [institutions, setInstitutions] = useState<any[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchAchievements()
    fetchSavedCandidates()
    fetchInstitutions()
  }, [])

  const fetchAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select(
          `
          *,
          student:profiles!achievements_student_id_fkey(
            id,
            full_name,
            email,
            institution:institutions(name)
          )
        `,
        )
        .eq("verification_status", "verified")
        .order("date_achieved", { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSavedCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_candidates")
        .select(
          `
          *,
          student:profiles!saved_candidates_student_id_fkey(
            full_name,
            email,
            institution:institutions(name)
          )
        `,
        )
        .eq("recruiter_id", user.id)
        .order("created_at", { ascending: false })

      if (error) throw error
      setSavedCandidates(data || [])
    } catch (error) {
      console.error("Error fetching saved candidates:", error)
    }
  }

  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabase.from("institutions").select("*").order("name")
      if (error) throw error
      setInstitutions(data || [])
    } catch (error) {
      console.error("Error fetching institutions:", error)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleSaveCandidate = async (studentId: string, notes = "") => {
    try {
      const { error } = await supabase.from("saved_candidates").insert({
        recruiter_id: user.id,
        student_id: studentId,
        notes,
      })

      if (error) throw error
      fetchSavedCandidates()
    } catch (error) {
      console.error("Error saving candidate:", error)
    }
  }

  const handleRemoveSavedCandidate = async (candidateId: string) => {
    try {
      const { error } = await supabase.from("saved_candidates").delete().eq("id", candidateId)

      if (error) throw error
      fetchSavedCandidates()
    } catch (error) {
      console.error("Error removing saved candidate:", error)
    }
  }

  const isStudentSaved = (studentId: string) => {
    return savedCandidates.some((candidate) => candidate.student_id === studentId)
  }

  const filteredAchievements = achievements.filter((achievement) => {
    const matchesSearch =
      achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      achievement.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = categoryFilter === "all" || achievement.category === categoryFilter

    const matchesInstitution =
      institutionFilter === "all" ||
      (achievement.student.institution && achievement.student.institution.name === institutionFilter)

    const matchesDate = (() => {
      if (dateFilter === "all") return true
      const achievementDate = new Date(achievement.date_achieved)
      const now = new Date()
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())

      switch (dateFilter) {
        case "recent":
          return achievementDate >= oneYearAgo
        case "last_two_years":
          return achievementDate >= twoYearsAgo
        default:
          return true
      }
    })()

    return matchesSearch && matchesCategory && matchesInstitution && matchesDate
  })

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

  const stats = {
    totalAchievements: achievements.length,
    uniqueStudents: new Set(achievements.map((a) => a.student.id)).size,
    savedCandidates: savedCandidates.length,
    topCategories: categories
      .map((cat) => ({
        category: cat,
        count: achievements.filter((a) => a.category === cat).length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Recruiter Dashboard</h1>
              <p className="text-slate-600">Discover verified student achievements</p>
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
                  <p className="text-sm font-medium text-slate-600">Verified Achievements</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalAchievements}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Unique Students</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.uniqueStudents}</p>
                </div>
                <UserIcon className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Saved Candidates</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.savedCandidates}</p>
                </div>
                <Bookmark className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Top Category</p>
                  <p className="text-lg font-bold text-slate-900">
                    {stats.topCategories[0]?.category.split(" ")[0] || "N/A"}
                  </p>
                  <p className="text-xs text-slate-500">{stats.topCategories[0]?.count || 0} achievements</p>
                </div>
                <Star className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search Achievements</TabsTrigger>
            <TabsTrigger value="saved">Saved Candidates ({savedCandidates.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="search" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Search & Filter
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search achievements, students, or skills..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Categories" />
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
                  <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Institutions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.name}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="All Time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="recent">Last Year</SelectItem>
                      <SelectItem value="last_two_years">Last 2 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Achievement Results */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading achievements...</p>
              </div>
            ) : filteredAchievements.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Search className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No achievements found</h3>
                  <p className="text-slate-600">Try adjusting your search criteria or filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600">
                    Showing {filteredAchievements.length} of {achievements.length} verified achievements
                  </p>
                </div>
                <div className="grid gap-4">
                  {filteredAchievements.map((achievement) => (
                    <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              <h3 className="text-lg font-semibold text-slate-900">{achievement.title}</h3>
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
                            </div>
                            <p className="text-slate-600 mb-3">{achievement.description}</p>
                            <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                              <div className="flex items-center gap-1">
                                <UserIcon className="w-4 h-4" />
                                <span>{achievement.student.full_name}</span>
                              </div>
                              {achievement.student.institution && (
                                <div className="flex items-center gap-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{achievement.student.institution.name}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
                              </div>
                              <Badge variant="outline">{achievement.category}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {achievement.document_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(achievement.document_url!, "_blank")}
                              >
                                <FileText className="w-4 h-4 mr-1" />
                                Document
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudent(achievement.student)
                                setIsProfileModalOpen(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedStudentForContact(achievement.student)
                                setIsContactModalOpen(true)
                              }}
                            >
                              <Mail className="w-4 h-4 mr-1" />
                              Contact
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSaveCandidate(achievement.student.id)}
                              disabled={isStudentSaved(achievement.student.id)}
                            >
                              {isStudentSaved(achievement.student.id) ? (
                                <Bookmark className="w-4 h-4 mr-1" />
                              ) : (
                                <BookmarkPlus className="w-4 h-4 mr-1" />
                              )}
                              {isStudentSaved(achievement.student.id) ? "Saved" : "Save"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Saved Candidates</h2>
            </div>

            {savedCandidates.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No saved candidates yet</h3>
                  <p className="text-slate-600">Save interesting candidates while browsing achievements.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {savedCandidates.map((candidate) => (
                  <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <UserIcon className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">{candidate.student.full_name}</h3>
                            <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">Saved</Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                            <span>{candidate.student.email}</span>
                            {candidate.student.institution && (
                              <div className="flex items-center gap-1">
                                <Building2 className="w-4 h-4" />
                                <span>{candidate.student.institution.name}</span>
                              </div>
                            )}
                            <span>Saved: {new Date(candidate.created_at).toLocaleDateString()}</span>
                          </div>
                          {candidate.notes && (
                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md mb-3">
                              <p className="text-sm text-slate-700">
                                <strong>Notes:</strong> {candidate.notes}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudent(candidate.student)
                              setIsProfileModalOpen(true)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Profile
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedStudentForContact(candidate.student)
                              setIsContactModalOpen(true)
                            }}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveSavedCandidate(candidate.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
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
      {selectedStudent && (
        <StudentProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => {
            setIsProfileModalOpen(false)
            setSelectedStudent(null)
          }}
          student={selectedStudent}
        />
      )}

      {selectedStudentForContact && (
        <ContactStudentModal
          isOpen={isContactModalOpen}
          onClose={() => {
            setIsContactModalOpen(false)
            setSelectedStudentForContact(null)
          }}
          student={selectedStudentForContact}
          recruiterName={profile.full_name}
        />
      )}
    </div>
  )
}
