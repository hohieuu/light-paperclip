import { useQuery } from "@tanstack/react-query";
import { modelProfilesApi } from "@/api";
import { queryKeys } from "@/lib/queryKeys";
import { Badge } from "@/components/ui/badge";

export function ModelProfiles() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: queryKeys.modelProfiles.list,
    queryFn: () => modelProfilesApi.list({ isActive: true }),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Model Profiles</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage available model configurations and pricing
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading...</div>
      ) : profiles && profiles.length > 0 ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Name</th>
                <th className="px-4 py-3 text-left font-medium">Provider</th>
                <th className="px-4 py-3 text-left font-medium">Tier</th>
                <th className="px-4 py-3 text-left font-medium">Input Cost</th>
                <th className="px-4 py-3 text-left font-medium">Output Cost</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((profile) => (
                <tr key={profile.id} className="border-b border-border hover:bg-muted/30">
                  <td className="px-4 py-3">{profile.name}</td>
                  <td className="px-4 py-3">{profile.provider}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">{profile.tier}</Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    ${(profile.inputCostPerMillionTokens / 100).toFixed(4)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    ${(profile.outputCostPerMillionTokens / 100).toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-sm text-muted-foreground py-8 text-center">
          No model profiles available
        </div>
      )}
    </div>
  );
}
