import Sidebar from '@/components/shared/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar user={{ email: 'guest@example.com', name: 'ゲスト', role: 'staff' }} />
      <main className="flex-1 ml-60 p-8">{children}</main>
    </div>
  )
}
