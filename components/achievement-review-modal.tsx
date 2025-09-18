"use client"

import { CardContent } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, FileText, User, Calendar } from "lucide-react"

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

interface AchievementReviewModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement
  onSuccess: () => void
  adminId: string
}

export function AchievementReviewModal({
  isOpen,
  onClose,
  achievement,
  onSuccess,
  adminId,
}: AchievementReviewModalProps) {
  const [decision, setDecision] = useState<"verify" | "reject" | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!decision) return

    setIsLoading(true)
    setError(null)

    try {
      const updateData: any = {
        verification_status: decision === "verify" ? "verified" : "rejected",
        verified_by: adminId,
        verified_at: new Date().toISOString(),
      }

      if (decision === "reject" && rejectionReason) {
        updateData.rejection_reason = rejectionReason
      }

      const { error: updateError } = await supabase.from("achievements").update(updateData).eq("id", achievement.id)

      if (updateError) throw updateError

      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred while updating the achievement")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Achievement Review</DialogTitle>
          <DialogDescription>Review and verify or reject this student achievement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Achievement Details */}
          <Card className="border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(achievement.verification_status)}
                  <h3 className="text-xl font-semibold text-slate-900">{achievement.title}</h3>
                  {getStatusBadge(achievement.verification_status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Student:</span>
                    <span>{achievement.student.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Email:</span>
                    <span>{achievement.student.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span className="font-medium">Date Achieved:</span>
                    <span>{new Date(achievement.date_achieved).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Category:</span>
                    <span>{achievement.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <span className="font-medium">Submitted:</span>
                    <span>{new Date(achievement.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {achievement.description && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Description:</h4>
                  <p className="text-slate-600">{achievement.description}</p>
                </div>
              )}

              {achievement.document_url && (
                <div className="mb-4">
                  <h4 className="font-medium text-slate-900 mb-2">Supporting Document:</h4>
                  <Button
                    variant="outline"
                    onClick={() => window.open(achievement.document_url!, "_blank")}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Document
                  </Button>
                </div>
              )}

              {achievement.verification_status === "rejected" && achievement.rejection_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="font-medium text-red-900 mb-2">Previous Rejection Reason:</h4>
                  <p className="text-red-800">{achievement.rejection_reason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Form */}
          {achievement.verification_status === "pending" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Label className="text-base font-medium text-slate-900">Review Decision</Label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={decision === "verify" ? "default" : "outline"}
                    onClick={() => setDecision("verify")}
                    className={decision === "verify" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify Achievement
                  </Button>
                  <Button
                    type="button"
                    variant={decision === "reject" ? "default" : "outline"}
                    onClick={() => setDecision("reject")}
                    className={decision === "reject" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject Achievement
                  </Button>
                </div>
              </div>

              {decision === "reject" && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">Rejection Reason *</Label>
                  <Textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejection..."
                    rows={4}
                    required
                  />
                </div>
              )}

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || !decision || (decision === "reject" && !rejectionReason)}
                  className={decision === "verify" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
                >
                  {isLoading ? "Processing..." : decision === "verify" ? "Verify Achievement" : "Reject Achievement"}
                </Button>
              </div>
            </form>
          )}

          {achievement.verification_status !== "pending" && (
            <div className="flex justify-end">
              <Button onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
