"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Activity, Database } from "lucide-react"

interface SystemStats {
  totalAchievements: number
  pendingVerifications: number
  verifiedAchievements: number
  rejectedAchievements: number
  openQueries: number
  resolvedQueries: number
}

export function SystemStatsCard() {
  const [stats, setStats] = useState<SystemStats>({
    totalAchievements: 0,
    pendingVerifications: 0,
    verifiedAchievements: 0,
    rejectedAchievements: 0,
    openQueries: 0,
    resolvedQueries: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      // Get achievement stats
      const { data: achievements } = await supabase.from("achievements").select("verification_status")

      // Get query stats
      const { data: queries } = await supabase.from("queries").select("status")

      const achievementStats = {
        totalAchievements: achievements?.length || 0,
        pendingVerifications: achievements?.filter((a) => a.verification_status === "pending").length || 0,
        verifiedAchievements: achievements?.filter((a) => a.verification_status === "verified").length || 0,
        rejectedAchievements: achievements?.filter((a) => a.verification_status === "rejected").length || 0,
      }

      const queryStats = {
        openQueries: queries?.filter((q) => q.status === "open").length || 0,
        resolvedQueries: queries?.filter((q) => q.status === "resolved").length || 0,
      }

      setStats({ ...achievementStats, ...queryStats })
    } catch (error) {
      console.error("Error fetching system stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-slate-600">Loading system statistics...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          System Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4" />
              Achievement Overview
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Total Submissions</span>
                <span className="font-medium">{stats.totalAchievements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Pending Review</span>
                <span className="font-medium text-yellow-600">{stats.pendingVerifications}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Verified</span>
                <span className="font-medium text-green-600">{stats.verifiedAchievements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Rejected</span>
                <span className="font-medium text-red-600">{stats.rejectedAchievements}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Query Management
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Open Queries</span>
                <span className="font-medium text-orange-600">{stats.openQueries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Resolved Queries</span>
                <span className="font-medium text-green-600">{stats.resolvedQueries}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Performance Metrics
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Verification Rate</span>
                <span className="font-medium text-blue-600">
                  {stats.totalAchievements > 0
                    ? Math.round((stats.verifiedAchievements / stats.totalAchievements) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Query Resolution Rate</span>
                <span className="font-medium text-blue-600">
                  {stats.openQueries + stats.resolvedQueries > 0
                    ? Math.round((stats.resolvedQueries / (stats.openQueries + stats.resolvedQueries)) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
