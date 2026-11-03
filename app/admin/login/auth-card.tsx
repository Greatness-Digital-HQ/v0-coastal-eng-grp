/** The centered card shared by the sign-in pages. */
export function AuthCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-c-left.png" alt="Coastal Engineering Group" className="mx-auto mb-8 h-12 w-auto" />
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="mb-1 text-2xl font-bold tracking-tight">{title}</h1>
          {children}
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">Website dashboard · Coastal Engineering Group</p>
      </div>
    </main>
  )
}
