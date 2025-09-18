"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Building2, Copy, Check } from "lucide-react"

interface Student {
  id: string
  full_name: string
  email: string
  institution?: {
    name: string
  }
}

interface ContactStudentModalProps {
  isOpen: boolean
  onClose: () => void
  student: Student
  recruiterName: string
}

export function ContactStudentModal({ isOpen, onClose, student, recruiterName }: ContactStudentModalProps) {
  const [subject, setSubject] = useState(`Opportunity from ${recruiterName}`)
  const [message, setMessage] = useState(
    `Dear ${student.full_name},\n\nI hope this message finds you well. I am ${recruiterName}, and I came across your impressive achievements through the student verification platform.\n\nI would like to discuss potential opportunities that might align with your skills and accomplishments. Would you be available for a brief conversation?\n\nBest regards,\n${recruiterName}`,
  )
  const [copied, setCopied] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(student.email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSendEmail = () => {
    const mailtoLink = `mailto:${student.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`
    window.open(mailtoLink)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Contact {student.full_name}
          </DialogTitle>
          <DialogDescription>Compose a message to reach out to this student</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <Card className="border border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{student.full_name}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
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
                <Button variant="outline" size="sm" onClick={handleCopyEmail}>
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied!" : "Copy Email"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Composer */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message to the student..."
                rows={12}
                className="resize-none"
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h4 className="font-medium text-blue-900 mb-2">Professional Communication Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be clear about the opportunity and your organization</li>
              <li>• Mention specific achievements that caught your attention</li>
              <li>• Provide your contact information and preferred communication method</li>
              <li>• Be respectful of their time and academic commitments</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} className="bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
