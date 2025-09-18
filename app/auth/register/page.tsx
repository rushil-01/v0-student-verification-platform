"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

interface Institution {
  id: string
  name: string
  domain: string
}

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("")
  const [institutionId, setInstitutionId] = useState("")
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [institutionsLoading, setInstitutionsLoading] = useState(true)
  const [institutionOpen, setInstitutionOpen] = useState(false)
  const router = useRouter()

  const fetchInstitutions = async () => {
    try {
      console.log("[v0] Fetching institutions...")
      setInstitutionsLoading(true)
      setError(null)
      const supabase = createClient()

      const { data, error } = await supabase.from("institutions").select("*").order("name")

      console.log("[v0] Institutions data:", data)
      console.log("[v0] Institutions error:", error)

      if (error) {
        console.error("[v0] Error fetching institutions:", error)
        setError(`Failed to load institutions: ${error.message}. Please try refreshing.`)
      } else if (data) {
        setInstitutions(data)
        console.log("[v0] Successfully loaded", data.length, "institutions")
        if (data.length === 0) {
          setError("No institutions found. Please contact support to populate the database.")
        }
      }
    } catch (err) {
      console.error("[v0] Exception fetching institutions:", err)
      setError("Network error loading institutions. Please check your connection and try again.")
    } finally {
      setInstitutionsLoading(false)
    }
  }

  useEffect(() => {
    fetchInstitutions()
  }, [])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!fullName || !email || !role || !password || !confirmPassword) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if ((role === "student" || role === "admin") && !institutionId) {
      setError("Please select your institution")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Attempting to register user with role:", role, "institution:", institutionId)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            role,
            institution_id: institutionId || null,
          },
        },
      })

      if (authError) {
        console.error("[v0] Auth error:", authError)
        throw authError
      }

      console.log("[v0] Registration successful, redirecting to verify email")
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      console.error("[v0] Registration error:", error)
      setError(error instanceof Error ? error.message : "An error occurred during registration")
    } finally {
      setIsLoading(false)
    }
  }

  const getSelectedInstitutionName = () => {
    const selected = institutions.find((inst) => inst.id === institutionId)
    return selected ? selected.name : "Select your institution"
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl font-bold text-slate-900">Create Account</CardTitle>
            <CardDescription className="text-slate-600">Join the student verification platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-slate-700">
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@university.edu"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700">
                  Role *
                </Label>
                <Select value={role} onValueChange={setRole} required>
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {(role === "student" || role === "admin") && (
                <div className="space-y-2">
                  <Label htmlFor="institution" className="text-slate-700">
                    Institution *
                  </Label>
                  {institutionsLoading ? (
                    <div className="border border-slate-200 rounded-md px-3 py-2 text-slate-500 bg-slate-50">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Loading institutions...</span>
                      </div>
                    </div>
                  ) : institutions.length === 0 ? (
                    <div className="space-y-2">
                      <div className="border border-red-200 rounded-md px-3 py-2 text-red-600 bg-red-50">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>No institutions found. Please contact support to populate the database.</span>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={fetchInstitutions}
                        disabled={institutionsLoading}
                        className="w-full bg-transparent hover:bg-slate-50"
                      >
                        {institutionsLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600"></div>
                            <span>Loading...</span>
                          </div>
                        ) : (
                          "Refresh Institutions"
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Popover open={institutionOpen} onOpenChange={setInstitutionOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={institutionOpen}
                          className="w-full justify-between border-slate-200 focus:border-blue-500 bg-transparent"
                        >
                          {getSelectedInstitutionName()}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search institutions..." />
                          <CommandList>
                            <CommandEmpty>No institution found.</CommandEmpty>
                            <CommandGroup>
                              {institutions.map((institution) => (
                                <CommandItem
                                  key={institution.id}
                                  value={institution.name}
                                  onSelect={() => {
                                    setInstitutionId(institution.id)
                                    setInstitutionOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      institutionId === institution.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {institution.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700">
                  Password *
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimum 6 characters"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700">
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-200">{error}</div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || institutionsLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
