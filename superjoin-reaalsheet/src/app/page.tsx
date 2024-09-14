'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function SyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)

  const triggerSync = async () => {
    setSyncStatus('syncing')
    try {
      const response = await fetch('/api/sync', { method: 'POST' })
      if (!response.ok) {
        throw new Error('Sync failed')
      }
      const data = await response.json()
      setSyncStatus('success')
      setLastSyncTime(new Date().toLocaleString())
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Google Sheets Sync Dashboard</CardTitle>
          <CardDescription>Synchronize your Google Sheets data with the database</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={triggerSync} 
              disabled={syncStatus === 'syncing'}
              className="w-full"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                'Trigger Sync'
              )}
            </Button>
            {syncStatus === 'success' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>Sync Successful</AlertTitle>
                <AlertDescription>
                  Your data has been successfully synchronized.
                </AlertDescription>
              </Alert>
            )}
            {syncStatus === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Sync Failed</AlertTitle>
                <AlertDescription>
                  There was an error synchronizing your data. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {lastSyncTime && (
            <p className="text-sm text-muted-foreground">
              Last synced: {lastSyncTime}
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}