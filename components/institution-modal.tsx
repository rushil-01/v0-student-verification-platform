"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Institution {
  id: string
  name: string
  domain: string
  created_at: string
}

interface InstitutionModalProps {
  isOpen: boolean
  onClose: () => void
  institution: Institution | null
  onSuccess: () => void
}

export function InstitutionModal({ isOpen, onClose, institution, onSuccess }: InstitutionModalProps) {
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (institution) {
      setName(institution.name)
      setDomain(institution.domain)
    } else {
      setName("")
      setDomain("")
    }
    setError(null)
  }, [institution, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (institution) {
        // Update existing institution
        const { error: updateError } = await supabase
          .from("institutions")
          .update({ name, domain })
          .eq("id", institution.id)

        if (updateError) throw updateError
      } else {
        // Create new institution
        const { error: insertError } = await supabase.from("institutions").insert({ name, domain })

        if (insertError) throw insertError
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the institution")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{institution ? "Edit Institution" : "Add New Institution"}</DialogTitle>
          <DialogDescription>
            {institution ? "Update the institution details." : "Create a new educational institution."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institution Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., University of Technology"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Email Domain *</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="e.g., utech.edu"
              required
            />
            <p className="text-xs text-slate-500">
              Students with this email domain will be associated with this institution.
            </p>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Saving..." : institution ? "Update Institution" : "Create Institution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
