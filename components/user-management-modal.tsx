"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Institution {
  id: string
  name: string
  domain: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string
  role: string
  institution_id?: string
  institution_ids?: string[]
}

interface UserManagementModalProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  institutions: Institution[]
  onSuccess: () => void
}

export function UserManagementModal({ isOpen, onClose, user, institutions, onSuccess }: UserManagementModalProps) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("student")
  const [institutionId, setInstitutionId] = useState("")
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setFullName(user.full_name)
      setRole(user.role)
      setInstitutionId(user.institution_id || "")
      setSelectedInstitutions(user.institution_ids || (user.institution_id ? [user.institution_id] : []))
      setPassword("")
    } else {
      setEmail("")
      setFullName("")
      setRole("student")
      setInstitutionId("")
      setSelectedInstitutions([])
      setPassword("")
    }
    setError(null)
  }, [user, isOpen])

  const handleInstitutionToggle = (institutionId: string, checked: boolean) => {
    if (checked) {
      setSelectedInstitutions((prev) => [...prev, institutionId])
    } else {
      setSelectedInstitutions((prev) => prev.filter((id) => id !== institutionId))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (user) {
        const updateData: any = {
          full_name: fullName,
          role,
        }

        if (role === "admin") {
          // For admins, store multiple institutions as JSON array
          updateData.institution_ids = selectedInstitutions
          updateData.institution_id = selectedInstitutions[0] || null // Keep primary for compatibility
        } else if (role === "student") {
          updateData.institution_id = institutionId || null
          updateData.institution_ids = null
        } else {
          updateData.institution_id = null
          updateData.institution_ids = null
        }

        const { error: updateError } = await supabase.from("profiles").update(updateData).eq("id", user.id)

        if (updateError) throw updateError
      } else {
        const userData: any = {
          full_name: fullName,
          role,
        }

        if (role === "admin") {
          userData.institution_ids = selectedInstitutions
          userData.institution_id = selectedInstitutions[0] || null
        } else if (role === "student") {
          userData.institution_id = institutionId || null
        }

        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: userData,
        })

        if (authError) throw authError
      }

      onSuccess()
    } catch (error: any) {
      setError(error.message || "An error occurred while saving the user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{user ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {user ? "Update the user details and permissions." : "Create a new user account."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={!!user}
              />
              {user && <p className="text-xs text-slate-500">Email cannot be changed after account creation.</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="recruiter">Recruiter</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === "student" && (
              <div className="space-y-2">
                <Label htmlFor="institution">Institution</Label>
                <Select value={institutionId} onValueChange={setInstitutionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select institution (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Institution</SelectItem>
                    {institutions.map((institution) => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {role === "admin" && (
              <div className="space-y-2">
                <Label>Institutions *</Label>
                <p className="text-xs text-slate-500 mb-3">Select all institutions this admin can manage</p>
                <div className="border border-slate-200 rounded-md p-3 max-h-48 overflow-y-auto">
                  {institutions.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-4">No institutions available</p>
                  ) : (
                    <div className="space-y-2">
                      {institutions.map((institution) => (
                        <div key={institution.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`institution-${institution.id}`}
                            checked={selectedInstitutions.includes(institution.id)}
                            onCheckedChange={(checked) => handleInstitutionToggle(institution.id, checked as boolean)}
                          />
                          <Label
                            htmlFor={`institution-${institution.id}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            {institution.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {selectedInstitutions.length === 0 && (
                  <p className="text-xs text-red-600">Please select at least one institution for admin users</p>
                )}
              </div>
            )}

            {!user && (
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
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
                disabled={isLoading || (role === "admin" && selectedInstitutions.length === 0)}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? "Saving..." : user ? "Update User" : "Create User"}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
