'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { syncSheetData } from '../app/actions/syncsheet'

export default function SyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const triggerSync = async () => {
    setSyncStatus('syncing')
    setErrorMessage(null)
    try {
      const result = await syncSheetData()
      if (result.success) {
        setSyncStatus('success')
        setLastSyncTime(new Date().toLocaleString())
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      console.error('Sync error:', error)
      setSyncStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Google Sheets Sync Dashboard</CardTitle>
          <CardDescription>
            Synchronize your Google Sheets data with database
          </CardDescription>
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
              <Alert className="border-green-500 bg-green-50 text-green-700">
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
                {errorMessage || 'There was an error synchronizing your data. Please try again.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
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