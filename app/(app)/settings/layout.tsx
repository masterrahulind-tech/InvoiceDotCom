import Link from "next/link";
import { Building, Users, MapPin } from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Organization Settings</h1>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <Link
          href="/settings/profile"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          <Building className="h-4 w-4" />
          Business Profile
        </Link>
        <Link
          href="/settings/team"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          <Users className="h-4 w-4" />
          Team Management
        </Link>
        <Link
          href="/settings/branches"
          className="flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-600 hover:border-gray-300 hover:text-gray-900"
        >
          <MapPin className="h-4 w-4" />
          Branches
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}
