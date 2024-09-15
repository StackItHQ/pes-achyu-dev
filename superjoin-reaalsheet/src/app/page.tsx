'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"
import { syncSheetData, startAutoSync, stopAutoSync } from './actions/syncsheet';

export default function SyncDashboard() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isAutoSyncOn, setIsAutoSyncOn] = useState(false)

  // useEffect(() => {
  //   // Check if auto-sync is already running when component mounts
  //   fetch('/api/autosyncstatus')
  //     .then(res => res.json())
  //     .then(data => setIsAutoSyncOn(data.isRunning))
  //     .catch(error => console.error('Error checking auto-sync status:', error))
  // }, [])

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('NEXT_PUBLIC_BASE_URL is not defined');
      setErrorMessage('Server configuration error. Please contact support.');
    }

    // Function to fetch the last sync time
    const fetchLastSyncTime = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/lastsynctime`);
        if (!response.ok) {
          throw new Error('Failed to fetch last sync time');
        }
        const data = await response.json();
        setLastSyncTime(data.lastSyncTime);
      } catch (error) {
        console.error('Error fetching last sync time:', error);
      }
    };

    // Fetch last sync time immediately
    fetchLastSyncTime();

    // Set up interval to fetch last sync time every 2 seconds
    const intervalId = setInterval(fetchLastSyncTime, 2000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);



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

  const toggleAutoSync = async () => {

    if (!process.env.NEXT_PUBLIC_BASE_URL) {
      setErrorMessage('Server configuration error. Please contact support.');
      return;
    }

    try {
      if (isAutoSyncOn) {
        await stopAutoSync()
      } else {
        await startAutoSync()
      }
      setIsAutoSyncOn(!isAutoSyncOn)
    } catch (error) {
      console.error('Error toggling auto-sync:', error)
      setErrorMessage('Failed to toggle auto-sync')
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
                'Trigger Manual Sync'
              )}
            </Button>
            <Button
              onClick={toggleAutoSync}
              className="w-full"
            >
              {isAutoSyncOn ? 'Stop Auto Sync' : 'Start Auto Sync (Every 2 seconds)'}
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
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Auto Sync: {isAutoSyncOn ? 'On' : 'Off'}
          </p>
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