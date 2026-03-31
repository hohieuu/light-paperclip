import { useQuery } from "@tanstack/react-query";
import { modelProfilesApi } from "@/api";
import { queryKeys } from "@/lib/queryKeys";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

export function ModelProfiles() {
  const { data: profiles, isLoading } = useQuery({
    queryKey: queryKeys.modelProfiles.list,
    queryFn: () => modelProfilesApi.list({ isActive: true }),
  });

  const columns = [
    {
      header: "Name",
      accessor: "name",
    },
    {
      header: "Provider",
      accessor: "provider",
    },
    {
      header: "Tier",
      accessor: "tier",
      cell: (value: string) => (
        <Badge variant="secondary">{value}</Badge>
      ),
    },
    {
      header: "Input Cost",
      accessor: "inputCostPerMillionTokens",
      cell: (value: number) => `$${(value / 100).toFixed(2)}`,
    },
    {
      header: "Output Cost",
      accessor: "outputCostPerMillionTokens",
      cell: (value: number) => `$${(value / 100).toFixed(2)}`,
    },
  ];

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
      ) : (
        <DataTable
          data={profiles ?? []}
          columns={columns}
          keyField="id"
        />
      )}
    </div>
  );
}
