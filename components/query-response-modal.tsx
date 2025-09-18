"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, User, Calendar } from "lucide-react"

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

interface QueryResponseModalProps {
  isOpen: boolean
  onClose: () => void
  query: Query
  onSuccess: () => void
  adminId: string
}

export function QueryResponseModal({ isOpen, onClose, query, onSuccess, adminId }: QueryResponseModalProps) {
  const [response, setResponse] = useState(query.admin_response || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: updateError } = await supabase
        .from("queries")
        .update({
          admin_response: response,
          status: "resolved",
          responded_by: adminId,
          responded_at: new Date().toISOString(),
        })
        .eq("id", query.id)

      if (updateError) throw updateError

      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred while responding to the query")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      default:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Open</Badge>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Query Response</DialogTitle>
          <DialogDescription>Respond to the student's query about their achievement.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Query Details */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-md">
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Query about "{query.achievement.title}"</h3>
              {getStatusBadge(query.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span className="font-medium">Student:</span>
                <span>{query.achievement.student.full_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span className="font-medium">Submitted:</span>
                <span>{new Date(query.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-slate-900 mb-2">Student's Query:</h4>
              <p className="text-slate-700 bg-white p-3 rounded border">{query.query_text}</p>
            </div>
          </div>

          {/* Response Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response">{query.status === "resolved" ? "Admin Response" : "Your Response *"}</Label>
              <Textarea
                id="response"
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Provide a detailed response to the student's query..."
                rows={6}
                required={query.status !== "resolved"}
                disabled={query.status === "resolved"}
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                {query.status === "resolved" ? "Close" : "Cancel"}
              </Button>
              {query.status !== "resolved" && (
                <Button
                  type="submit"
                  disabled={isLoading || !response.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Sending..." : "Send Response"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
