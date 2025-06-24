import { useSearchContext } from "../contexts/SearchContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function CompactFilters() {
  const { searchParams, setSearchParams } = useSearchContext();

  return (
    <div className="px-4 py-3 border-t border-gray-700/50">
      <div className="mx-auto">
        <div className="flex gap-3 items-center">
          <Input
            type="text"
            placeholder="From"
            className="flex-1"
            value={searchParams.from}
            onChange={(e) => setSearchParams(prev => ({ ...prev, from: e.target.value }))}
          />
          
          <Input
            type="text"
            placeholder="To"
            className="flex-1"
            value={searchParams.to}
            onChange={(e) => setSearchParams(prev => ({ ...prev, to: e.target.value }))}
          />
          
          <Input
            type="date"
            className="w-[140px]"
            value={searchParams.departure}
            onChange={(e) => setSearchParams(prev => ({ ...prev, departure: e.target.value }))}
          />
          
          <Button
            className="bg-yellow-400 text-black hover:bg-yellow-500 flex-shrink-0"
            onClick={() => {
              console.log("Searching with params:", searchParams);
            }}
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
