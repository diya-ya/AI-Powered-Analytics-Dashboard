import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function FilesPage() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Other Files</CardTitle>
              <CardDescription>Manage other document files</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Files management page coming soon...</p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

