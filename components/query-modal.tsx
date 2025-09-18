"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Achievement {
  id: string
  title: string
  rejection_reason: string | null
}

interface QueryModalProps {
  isOpen: boolean
  onClose: () => void
  achievement: Achievement
  userId: string
}

export function QueryModal({ isOpen, onClose, achievement, userId }: QueryModalProps) {
  const [queryText, setQueryText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error: insertError } = await supabase.from("queries").insert({
        achievement_id: achievement.id,
        student_id: userId,
        query_text: queryText,
      })

      if (insertError) throw insertError

      setQueryText("")
      onClose()
    } catch (error: any) {
      setError(error.message || "An error occurred while submitting your query")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit Query</DialogTitle>
          <DialogDescription>
            Question the rejection of "{achievement.title}" and request clarification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {achievement.rejection_reason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                <strong>Rejection Reason:</strong> {achievement.rejection_reason}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="queryText">Your Query *</Label>
              <Textarea
                id="queryText"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="Explain why you believe this achievement should be verified or ask for clarification..."
                rows={4}
                required
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Submitting..." : "Submit Query"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
