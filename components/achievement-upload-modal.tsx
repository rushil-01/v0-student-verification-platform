"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"

interface AchievementUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export function AchievementUploadModal({ isOpen, onClose, onSuccess, userId }: AchievementUploadModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [dateAchieved, setDateAchieved] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      let documentUrl = null

      // Upload file if provided
      if (file) {
        const fileExt = file.name.split(".").pop()
        const fileName = `${userId}/${Date.now()}.${fileExt}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("achievement-documents")
          .upload(fileName, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("achievement-documents").getPublicUrl(fileName)

        documentUrl = publicUrl
      }

      // Insert achievement record
      const { error: insertError } = await supabase.from("achievements").insert({
        student_id: userId,
        title,
        description,
        category,
        date_achieved: dateAchieved,
        document_url: documentUrl,
      })

      if (insertError) throw insertError

      // Reset form
      setTitle("")
      setDescription("")
      setCategory("")
      setDateAchieved("")
      setFile(null)

      onSuccess()
      onClose()
    } catch (error: any) {
      setError(error.message || "An error occurred while uploading")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be less than 10MB")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Achievement</DialogTitle>
          <DialogDescription>
            Upload your achievement details and supporting documents for verification.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Achievement Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dean's List Fall 2023"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide additional details about your achievement..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select achievement category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateAchieved">Date Achieved *</Label>
            <Input
              id="dateAchieved"
              type="date"
              value={dateAchieved}
              onChange={(e) => setDateAchieved(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document">Supporting Document</Label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
              {file ? (
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                  <span className="text-sm text-slate-700">{file.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-2">
                    Upload certificate, transcript, or other supporting document
                  </p>
                  <p className="text-xs text-slate-500 mb-4">PDF, JPG, PNG up to 10MB</p>
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Choose File
                  </Label>
                </div>
              )}
            </div>
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Uploading..." : "Submit Achievement"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
