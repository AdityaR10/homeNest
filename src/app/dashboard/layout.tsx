 export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-screen"> 
      <main>
        <div className="container mx-auto p-6">
          {children}
        </div>
      </main>
    </div>
  )
} 