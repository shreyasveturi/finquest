import AdminExportPanel from '@/components/AdminExportPanel';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenParam = Array.isArray(params.token) ? params.token[0] : params.token;

  if (!process.env.ADMIN_EXPORT_TOKEN || tokenParam !== process.env.ADMIN_EXPORT_TOKEN) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Unauthorized</h1>
          <p className="text-sm text-neutral-600">Invalid or missing token.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-neutral-900">Admin Export</h1>
          <p className="text-sm text-neutral-600">Download rounds and matches CSV exports.</p>
        </div>

        <AdminExportPanel token={tokenParam} />
      </div>
    </div>
  );
}
