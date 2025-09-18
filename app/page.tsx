import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-slate-900 mb-6 text-balance">
            Student Achievement Verification Platform
          </h1>
          <p className="text-xl text-slate-600 mb-8 text-pretty">
            Secure, transparent, and efficient verification of student achievements for educational institutions and
            recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-300 bg-transparent">
              <Link href="/auth/register">Create Account</Link>
            </Button>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-12 h-12 mx-auto bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Verification</h3>
            <p className="text-slate-600">Multi-level verification process ensures authenticity of all achievements.</p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Full Transparency</h3>
            <p className="text-slate-600">
              Complete audit trail and transparent verification process for all stakeholders.
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-slate-200">
            <div className="w-12 h-12 mx-auto bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Role-Based Access</h3>
            <p className="text-slate-600">
              Tailored interfaces for students, admins, and recruiters with appropriate permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
