import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900">
            <Link href="/admin">Quiz Admin</Link>
          </div>
          <div className="space-x-6">
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link
              href="/admin/settings"
              className="text-gray-600 hover:text-gray-900"
            >
              Settings
            </Link>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
