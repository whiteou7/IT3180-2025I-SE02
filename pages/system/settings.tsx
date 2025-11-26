import { useState, useCallback, useEffect } from "react"
import Head from "next/head"
import { ofetch } from "ofetch"
import { toast } from "sonner"
import {
  Database,
  Eye,
  EyeOff,
  Copy,
  Check,
  FileText,
  Server,
  HardDrive,
  Loader2,
} from "lucide-react"

import { AuthGate } from "@/components/auth/auth-gate"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useUserStore } from "@/store/userStore"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"

type DatabaseDumpOptions = {
  format: "sql" | "csv" | "json"
  includeSchema: boolean
  includeData: boolean
  tables?: string[]
}

type DumpCommand = {
  id: string
  timestamp: string
  format: string
  filename: string
  command: string
}

type SystemSettings = {
  previewMode: boolean
  databaseUrl: string
  storageUrl: string
  storageKey: string
}

export default function SystemSettingsPage() {
  const { userId, role } = useUserStore()
  const isAdmin = role === "admin"
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isDumping, setIsDumping] = useState(false)
  const [dumpOptions, setDumpOptions] = useState<DatabaseDumpOptions>({
    format: "sql",
    includeSchema: true,
    includeData: true,
  })
  const [dumpCommands, setDumpCommands] = useState<DumpCommand[]>([])
  const [selectedCommand, setSelectedCommand] = useState<DumpCommand | null>(null)
  const [dbStatus, setDbStatus] = useState<"connected" | "disconnected" | "checking">("checking")
  const [storageStatus, setStorageStatus] = useState<"connected" | "disconnected" | "checking">("checking")

  // Fetch system settings from API
  useEffect(() => {
    if (!isAdmin) return

    const fetchSettings = async () => {
      setIsLoadingSettings(true)
      try {
        const response = await ofetch<{ success: boolean; data: SystemSettings; message?: string }>("/api/system/settings", {
          ignoreResponseError: true,
        })

        if (response?.success && response.data) {
          setSettings(response.data)
        } else {
          toast.error("Failed to load system settings")
        }
      } catch (error) {
        console.error(error)
        toast.error("Failed to load system settings")
      } finally {
        setIsLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [isAdmin])

  const getDatabaseUrl = () => {
    if (!settings) return "Loading..."
    const url = settings.databaseUrl
    if (settings.previewMode && url) {
      // Censor credentials in preview mode
      try {
        const urlObj = new URL(url)
        return `${urlObj.protocol}//***:***@${urlObj.host}${urlObj.pathname}`
      } catch {
        return "postgresql://***:***@host:port/dbname"
      }
    }
    return url || "Not configured"
  }

  const getStorageUrl = () => {
    if (!settings) return "Loading..."
    return settings.storageUrl || "Not configured"
  }

  const getStorageKey = () => {
    if (!settings) return "Loading..."
    const key = settings.storageKey
    if (settings.previewMode && key) {
      // Censor key in preview mode
      if (key.length > 20) {
        return `sb-${key.substring(2, 5)}...${key.substring(key.length - 5)}`
      }
      return "sb-***...***"
    }
    return key || "Not configured"
  }

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopiedField(null), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const checkDatabaseStatus = useCallback(async () => {
    setDbStatus("checking")
    try {
      // Simple health check - try to fetch users (lightweight query)
      const response = await ofetch("/api/users", {
        method: "GET",
        ignoreResponseError: true,
      })
      if (response?.success) {
        setDbStatus("connected")
      } else {
        setDbStatus("disconnected")
      }
    } catch {
      setDbStatus("disconnected")
    }
  }, [])

  const checkStorageStatus = useCallback(async () => {
    setStorageStatus("checking")
    try {
      // Check if Supabase URL is configured
      if (!settings) {
        setStorageStatus("disconnected")
        return
      }
      const url = settings.storageUrl
      if (url && url !== "Not configured") {
        setStorageStatus("connected")
      } else {
        setStorageStatus("disconnected")
      }
    } catch {
      setStorageStatus("disconnected")
    }
  }, [settings])

  const handleDumpDatabase = async () => {
    if (!isAdmin) {
      toast.error("Admin access required")
      return
    }

    setIsDumping(true)
    try {
      const response = await ofetch<{ success: boolean; data?: { command: string; filename: string }; message?: string }>("/api/system/dump", {
        method: "POST",
        body: dumpOptions,
        ignoreResponseError: true,
      })

      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to generate dump command")
      }

      if (response.data) {
        const newCommand: DumpCommand = {
          id: globalThis.crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          format: dumpOptions.format,
          filename: response.data.filename,
          command: response.data.command,
        }
        setDumpCommands((prev) => [newCommand, ...prev])
        setSelectedCommand(newCommand)
        toast.success("Database dump command generated successfully")
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to generate database dump command")
    } finally {
      setIsDumping(false)
    }
  }

  const handleCopyCommand = async (command: string, commandId?: string) => {
    try {
      await navigator.clipboard.writeText(command)
      if (commandId) {
        setCopiedField(`command-${commandId}`)
        setTimeout(() => setCopiedField(null), 2000)
      }
      toast.success("Command copied to clipboard")
    } catch {
      toast.error("Failed to copy command")
    }
  }

  // Check status on mount
  useEffect(() => {
    checkDatabaseStatus()
    checkStorageStatus()
  }, [checkDatabaseStatus, checkStorageStatus])

  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>System Settings • Access Denied</title>
        </Head>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
          <AuthGate
            isAuthenticated={Boolean(userId)}
            title="Access Denied"
            description="System settings are only accessible to administrators."
          >
            <div />
          </AuthGate>
        </div>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>System Settings • System Operations</title>
      </Head>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 pb-12 pt-24">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>System Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground text-sm">
              Manage database connections, storage, and system operations.
            </p>
          </div>
        </div>

        <AuthGate isAuthenticated={Boolean(userId)}>
          <Tabs defaultValue="database" className="w-full">
            <TabsList>
              <TabsTrigger value="database">Database & Storage</TabsTrigger>
            </TabsList>

            <TabsContent value="database" className="space-y-6">
              {/* Preview Mode Toggle */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Preview Mode</CardTitle>
                      <CardDescription>
                        Preview mode status (read-only, controlled by environment variable)
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {settings?.previewMode ? (
                        <EyeOff className="size-4 text-muted-foreground" />
                      ) : (
                        <Eye className="size-4 text-muted-foreground" />
                      )}
                      <Badge variant={settings?.previewMode ? "default" : "secondary"}>
                        {isLoadingSettings ? "Loading..." : settings?.previewMode ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* PostgreSQL Connection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Database className="size-5" />
                    <CardTitle>PostgreSQL Database</CardTitle>
                  </div>
                  <CardDescription>
                    Database connection configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Connection String</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm break-all">
                        {isLoadingSettings ? "Loading..." : getDatabaseUrl()}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(getDatabaseUrl(), "db-url")}
                        disabled={isLoadingSettings || !settings}
                      >
                        {copiedField === "db-url" ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={dbStatus === "connected" ? "default" : "destructive"}
                    >
                      {dbStatus === "checking" ? (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                      ) : null}
                      {dbStatus === "connected" ? "Connected" : dbStatus === "disconnected" ? "Disconnected" : "Checking..."}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkDatabaseStatus}
                      disabled={dbStatus === "checking"}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Supabase Storage */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-5" />
                    <CardTitle>Supabase Storage</CardTitle>
                  </div>
                  <CardDescription>
                    File storage configuration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Storage URL</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm break-all">
                        {isLoadingSettings ? "Loading..." : getStorageUrl()}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(getStorageUrl(), "storage-url")}
                        disabled={isLoadingSettings || !settings}
                      >
                        {copiedField === "storage-url" ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded-md bg-muted px-3 py-2 text-sm break-all">
                        {isLoadingSettings ? "Loading..." : getStorageKey()}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(getStorageKey(), "storage-key")}
                        disabled={isLoadingSettings || !settings}
                      >
                        {copiedField === "storage-key" ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={storageStatus === "connected" ? "default" : "destructive"}
                    >
                      {storageStatus === "checking" ? (
                        <Loader2 className="mr-1 size-3 animate-spin" />
                      ) : null}
                      {storageStatus === "connected" ? "Connected" : storageStatus === "disconnected" ? "Disconnected" : "Checking..."}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkStorageStatus}
                      disabled={storageStatus === "checking"}
                    >
                      Refresh Status
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Database Dump Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Server className="size-5" />
                    <CardTitle>Database Dump</CardTitle>
                  </div>
                  <CardDescription>
                    Export database schema and data
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Dump Format</Label>
                      <Select
                        value={dumpOptions.format}
                        onValueChange={(value) =>
                          setDumpOptions((prev) => ({ ...prev, format: value as "sql" | "csv" | "json" }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sql">SQL</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="json">JSON</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Include Schema</Label>
                        <p className="text-muted-foreground text-xs">
                          Export table structures and constraints
                        </p>
                      </div>
                      <Switch
                        checked={dumpOptions.includeSchema}
                        onCheckedChange={(checked) =>
                          setDumpOptions((prev) => ({ ...prev, includeSchema: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Include Data</Label>
                        <p className="text-muted-foreground text-xs">
                          Export table data rows
                        </p>
                      </div>
                      <Switch
                        checked={dumpOptions.includeData}
                        onCheckedChange={(checked) =>
                          setDumpOptions((prev) => ({ ...prev, includeData: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button
                    onClick={handleDumpDatabase}
                    disabled={isDumping || (!dumpOptions.includeSchema && !dumpOptions.includeData)}
                    className="w-full"
                  >
                    {isDumping ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Generating command...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 size-4" />
                        Generate Dump Command
                      </>
                    )}
                  </Button>

                  {selectedCommand && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Generated Command</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyCommand(selectedCommand.command, selectedCommand.id)}
                        >
                          {copiedField === `command-${selectedCommand.id}` ? (
                            <Check className="mr-2 size-4" />
                          ) : (
                            <Copy className="mr-2 size-4" />
                          )}
                          Copy Command
                        </Button>
                      </div>
                      <div className="rounded-md border bg-muted/50 p-4">
                        <code className="block whitespace-pre-wrap break-all text-sm">
                          {selectedCommand.command}
                        </code>
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Run this command in your terminal to create the database dump file: {selectedCommand.filename}
                      </p>
                    </div>
                  )}

                  {dumpCommands.length > 0 && (
                    <div className="space-y-2">
                      <Label>Command History</Label>
                      <div className="space-y-2">
                        {dumpCommands.map((cmd) => (
                          <div
                            key={cmd.id}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <FileText className="size-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{cmd.filename}</p>
                                <p className="text-muted-foreground text-xs">
                                  {new Date(cmd.timestamp).toLocaleString()} • {cmd.format.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedCommand(cmd)
                                  handleCopyCommand(cmd.command)
                                }}
                              >
                                <Copy className="mr-2 size-4" />
                                Copy
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCommand(cmd)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </AuthGate>
      </div>
    </>
  )
}
