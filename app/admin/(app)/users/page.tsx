import type { Metadata } from "next"
import { asc } from "drizzle-orm"
import { db, schema } from "@/db"
import { requireOwner } from "@/lib/auth"
import { formatDate, PageHeader, Panel, Pill } from "../ui"
import { setDisabled, setRole } from "./actions"
import { InviteForm } from "./invite-form"

export const metadata: Metadata = { title: "Users" }

export default async function UsersPage() {
  const me = await requireOwner()
  const users = await db().select().from(schema.users).orderBy(asc(schema.users.disabledAt), asc(schema.users.email))

  return (
    <>
      <PageHeader title="Users" description="Who can sign in to this dashboard. Editors manage content and inquiries; owners also manage users." />
      <Panel title="Add a user" className="mb-6">
        <InviteForm />
      </Panel>
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-slate-50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Person</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Last sign-in</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => (
              <tr key={u.id} className={u.disabledAt ? "text-muted-foreground" : undefined}>
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name || u.email}</p>
                  {u.name && <p className="text-xs text-muted-foreground">{u.email}</p>}
                </td>
                <td className="px-4 py-3">
                  {u.disabledAt ? (
                    <Pill tone="red">Removed</Pill>
                  ) : (
                    <form action={setRole} className="flex items-center gap-2">
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} className="h-8 rounded-md border bg-white px-2 text-sm" aria-label={`Role for ${u.email}`}>
                        <option value="editor">Editor</option>
                        <option value="owner">Owner</option>
                      </select>
                      <button type="submit" className="text-xs text-sky-700 hover:underline">
                        Save
                      </button>
                    </form>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{u.lastLoginAt ? formatDate(u.lastLoginAt, true) : "Never"}</td>
                <td className="px-4 py-3 text-right">
                  {u.id !== me.id && (
                    <form action={setDisabled}>
                      <input type="hidden" name="id" value={u.id} />
                      <input type="hidden" name="disable" value={u.disabledAt ? "0" : "1"} />
                      <button type="submit" className={u.disabledAt ? "text-sm text-sky-700 hover:underline" : "text-sm text-rose-700 hover:underline"}>
                        {u.disabledAt ? "Restore access" : "Remove access"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
