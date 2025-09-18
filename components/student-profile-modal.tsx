"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, FileText, Calendar, Building2, User, Mail } from "lucide-react"

interface Student {
  id: string
  full_name: string
  email: string
  institution?: {
    name: string
  }
}

interface Achievement {
  id: string
  title: string
  description: string
  category: string
  date_achieved: string
  document_url: string | null
  verification_status: string
  created_at: string
}

interface StudentProfileModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
}

export function StudentProfileModal({ isOpen, onClose, student }: StudentProfileModalProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && student) {
      fetchStudentAchievements()
    }
  }, [isOpen, student])

  const fetchStudentAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("student_id", student.id)
        .eq("verification_status", "verified")
        .order("date_achieved", { ascending: false })

      if (error) throw error
      setAchievements(data || [])
    } catch (error) {
      console.error("Error fetching student achievements:", error)
    } finally {
      setLoading(false)
    }
  }

  const achievementsByCategory = achievements.reduce(
    (acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = []
      }
      acc[achievement.category].push(achievement)
      return acc
    },
    {} as Record<string, Achievement[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {student.full_name} - Student Profile
          </DialogTitle>
          <DialogDescription>Verified achievements and academic profile</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{student.full_name}</h3>
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{student.email}</span>
                    </div>
                    {student.institution && (
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{student.institution.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{achievements.length}</p>
                  <p className="text-sm text-green-700">Verified Achievements</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{Object.keys(achievementsByCategory).length}</p>
                  <p className="text-sm text-blue-700">Categories</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {achievements.filter((a) => a.document_url).length}
                  </p>
                  <p className="text-sm text-purple-700">With Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading achievements...</p>
            </div>
          ) : achievements.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No verified achievements</h3>
                <p className="text-slate-600">This student has no verified achievements yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-slate-900">Verified Achievements</h3>
              {Object.entries(achievementsByCategory).map(([category, categoryAchievements]) => (
                <div key={category} className="space-y-3">
                  <h4 className="font-medium text-slate-800 flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                    <span className="text-sm text-slate-500">({categoryAchievements.length})</span>
                  </h4>
                  <div className="grid gap-3">
                    {categoryAchievements.map((achievement) => (
                      <Card key={achievement.id} className="border border-slate-200">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <h5 className="font-medium text-slate-900">{achievement.title}</h5>
                              </div>
                              {achievement.description && (
                                <p className="text-sm text-slate-600 mb-2">{achievement.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
                                </div>
                                <span>Verified: {new Date(achievement.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            {achievement.document_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(achievement.document_url!, "_blank")}
                              >
                                <FileText className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={onClose}>Close Profile</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
