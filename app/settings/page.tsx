import { auth } from "@/lib/auth/config"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { ApiKeySettings } from "@/components/settings/api-key-settings"

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      avatar: true,
      emailEnabled: true
    }
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          {/* Profile Settings */}
          <ProfileSettings user={user} />

          {/* AI API Key Settings */}
          <ApiKeySettings />

          {/* Other settings sections can be added here */}
          {/* Preferences, Notifications, etc. */}
        </div>
      </div>
    </DashboardLayout>
  )
}
