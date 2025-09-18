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
  Building2,
  Users,
  FileText,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  BarChart3,
} from "lucide-react"
import { InstitutionModal } from "@/components/institution-modal"
import { UserManagementModal } from "@/components/user-management-modal"
import { SystemStatsCard } from "@/components/system-stats-card"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  email: string
  full_name: string
  role: string
  institution_id: string
  created_at: string
}

interface Institution {
  id: string
  name: string
  domain: string
  created_at: string
  _count?: {
    students: number
    admins: number
  }
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  institution?: {
    name: string
  }
}

interface SuperAdminDashboardProps {
  user: User
  profile: Profile
}

export function SuperAdminDashboard({ user, profile }: SuperAdminDashboardProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [isInstitutionModalOpen, setIsInstitutionModalOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [institutionFilter, setInstitutionFilter] = useState("all")

  const supabase = createClient()

  useEffect(() => {
    fetchInstitutions()
    fetchUsers()
  }, [])

  const fetchInstitutions = async () => {
    try {
      const { data, error } = await supabase.from("institutions").select("*").order("created_at", { ascending: false })

      if (error) throw error

      // Get user counts for each institution
      const institutionsWithCounts = await Promise.all(
        (data || []).map(async (institution) => {
          const { data: students } = await supabase
            .from("profiles")
            .select("id")
            .eq("institution_id", institution.id)
            .eq("role", "student")

          const { data: admins } = await supabase
            .from("profiles")
            .select("id")
            .eq("institution_id", institution.id)
            .eq("role", "admin")

          return {
            ...institution,
            _count: {
              students: students?.length || 0,
              admins: admins?.length || 0,
            },
          }
        }),
      )

      setInstitutions(institutionsWithCounts)
    } catch (error) {
      console.error("Error fetching institutions:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          institution:institutions(name)
        `,
        )
        .order("created_at", { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const handleDeleteInstitution = async (institutionId: string) => {
    if (!confirm("Are you sure you want to delete this institution? This action cannot be undone.")) {
      return
    }

    try {
      const { error } = await supabase.from("institutions").delete().eq("id", institutionId)
      if (error) throw error
      fetchInstitutions()
    } catch (error) {
      console.error("Error deleting institution:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return
    }

    try {
      // Delete from auth.users (this will cascade to profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) throw error
      fetchUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter
    const matchesInstitution =
      institutionFilter === "all" ||
      user.institution_id === institutionFilter ||
      (institutionFilter === "no_institution" && !user.institution_id)

    return matchesSearch && matchesRole && matchesInstitution
  })

  const stats = {
    totalInstitutions: institutions.length,
    totalUsers: users.length,
    totalStudents: users.filter((u) => u.role === "student").length,
    totalAdmins: users.filter((u) => u.role === "admin").length,
    totalRecruiters: users.filter((u) => u.role === "recruiter").length,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Super Admin Dashboard</h1>
              <p className="text-slate-600">System Management & Oversight</p>
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
                  <p className="text-sm font-medium text-slate-600">Institutions</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalInstitutions}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Students</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.totalStudents}</p>
                </div>
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Admins</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalAdmins}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Recruiters</p>
                  <p className="text-2xl font-bold text-teal-600">{stats.totalRecruiters}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-teal-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Stats */}
        <SystemStatsCard />

        {/* Main Content */}
        <Tabs defaultValue="institutions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="institutions">Institutions</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="system">System Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="institutions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Institution Management</h2>
              <Button
                onClick={() => {
                  setSelectedInstitution(null)
                  setIsInstitutionModalOpen(true)
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Institution
              </Button>
            </div>

            {institutions.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No institutions yet</h3>
                  <p className="text-slate-600 mb-4">Start by adding your first institution.</p>
                  <Button
                    onClick={() => {
                      setSelectedInstitution(null)
                      setIsInstitutionModalOpen(true)
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Institution
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {institutions.map((institution) => (
                  <Card key={institution.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <h3 className="text-lg font-semibold text-slate-900">{institution.name}</h3>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-500 mb-3">
                            <span>Domain: {institution.domain}</span>
                            <span>Students: {institution._count?.students || 0}</span>
                            <span>Admins: {institution._count?.admins || 0}</span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Created: {new Date(institution.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedInstitution(institution)
                              setIsInstitutionModalOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteInstitution(institution.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">User Management</h2>
              <Button
                onClick={() => {
                  setSelectedUser(null)
                  setIsUserModalOpen(true)
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>

            {/* User Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                      <SelectItem value="recruiter">Recruiters</SelectItem>
                      <SelectItem value="super_admin">Super Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={institutionFilter} onValueChange={setInstitutionFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Filter by institution" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Institutions</SelectItem>
                      <SelectItem value="no_institution">No Institution</SelectItem>
                      {institutions.map((institution) => (
                        <SelectItem key={institution.id} value={institution.id}>
                          {institution.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* User List */}
            {loading ? (
              <div className="text-center py-8">
                <p className="text-slate-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No users found</h3>
                  <p className="text-slate-600">No users match your current filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-green-600" />
                            <h3 className="text-lg font-semibold text-slate-900">{user.full_name}</h3>
                            <Badge
                              className={
                                user.role === "super_admin"
                                  ? "bg-red-100 text-red-800 hover:bg-red-100"
                                  : user.role === "admin"
                                    ? "bg-orange-100 text-orange-800 hover:bg-orange-100"
                                    : user.role === "recruiter"
                                      ? "bg-teal-100 text-teal-800 hover:bg-teal-100"
                                      : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                              }
                            >
                              {user.role.replace("_", " ").toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-6 text-sm text-slate-500 mb-2">
                            <span>{user.email}</span>
                            {user.institution && <span>Institution: {user.institution.name}</span>}
                          </div>
                          <p className="text-xs text-slate-400">
                            Joined: {new Date(user.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsUserModalOpen(true)
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {user.id !== profile.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
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

          <TabsContent value="system" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">System Settings</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Platform Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-600">System configuration options will be available in future updates.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-slate-200 rounded-md">
                    <h4 className="font-medium text-slate-900 mb-2">Email Notifications</h4>
                    <p className="text-sm text-slate-600">Configure email notification settings for users.</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-md">
                    <h4 className="font-medium text-slate-900 mb-2">File Upload Limits</h4>
                    <p className="text-sm text-slate-600">Manage file size and type restrictions.</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-md">
                    <h4 className="font-medium text-slate-900 mb-2">Verification Workflow</h4>
                    <p className="text-sm text-slate-600">Customize the achievement verification process.</p>
                  </div>
                  <div className="p-4 border border-slate-200 rounded-md">
                    <h4 className="font-medium text-slate-900 mb-2">Data Retention</h4>
                    <p className="text-sm text-slate-600">Configure data retention and archival policies.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <InstitutionModal
        isOpen={isInstitutionModalOpen}
        onClose={() => {
          setIsInstitutionModalOpen(false)
          setSelectedInstitution(null)
        }}
        institution={selectedInstitution}
        onSuccess={() => {
          fetchInstitutions()
          setIsInstitutionModalOpen(false)
          setSelectedInstitution(null)
        }}
      />

      <UserManagementModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
        user={selectedUser}
        institutions={institutions}
        onSuccess={() => {
          fetchUsers()
          setIsUserModalOpen(false)
          setSelectedUser(null)
        }}
      />
    </div>
  )
}
