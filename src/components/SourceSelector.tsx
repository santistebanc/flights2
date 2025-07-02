import { useSearchContext, ScrapingSource } from "../SearchContext";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function SourceSelector() {
  const { searchParams, setSearchParams } = useSearchContext();

  // Defensive: fallback to empty array if sources is undefined
  const sources: ScrapingSource[] = searchParams.sources ?? [];

  const handleSourceToggle = (sourceId: string, enabled: boolean) => {
    setSearchParams(prev => ({
      ...prev,
      sources: (prev.sources ?? []).map(source => 
        source.id === sourceId ? { ...source, enabled } : source
      )
    }));
  };

  const enabledSourcesCount = sources.filter(s => s.enabled).length;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-white">
          Data Sources ({enabledSourcesCount}/{sources.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id={`source-${source.id}`}
                checked={source.enabled}
                onCheckedChange={(enabled) => handleSourceToggle(source.id, enabled)}
                className="data-[state=checked]:bg-yellow-500"
              />
              <Label 
                htmlFor={`source-${source.id}`} 
                className="text-sm text-gray-300 cursor-pointer"
              >
                {source.name}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                source.enabled ? 'bg-green-400' : 'bg-gray-500'
              }`} />
              <span className="text-xs text-gray-400">
                {source.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        ))}
        <div className="text-xs text-gray-500 pt-2 border-t border-gray-700">
          Select which sources to search for flights. More sources may provide more results but take longer to search.
        </div>
      </CardContent>
    </Card>
  );
} 