import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import * as Cmdk from "cmdk";

interface AirportInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  otherAirportValue?: string;
  id?: string;
}

export function AirportInput({
  value,
  onChange,
  placeholder = "Airport",
  className,
  required = false,
  error,
  otherAirportValue,
  id,
}: AirportInputProps) {
  const [open, setOpen] = useState(false);

  // Check if airports are the same (duplicate)
  const isDuplicateAirport =
    otherAirportValue && value.length > 0 && value === otherAirportValue;

  // Fetch airports when typing
  const airports = useQuery(
    api.airports.searchAirports,
    value.length > 0 ? { searchTerm: value, limit: 6 } : "skip"
  );

  const handleSelect = (iataCode: string) => {
    onChange(iataCode);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase();
            onChange(newValue);
            setOpen(newValue.length > 0);
          }}
          onFocus={() => setOpen(value.length > 0)}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!(error || isDuplicateAirport)}
          className={className}
          autoComplete="off"
          maxLength={3}
        />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-64" align="start">
        <Cmdk.Command>
          <Cmdk.CommandList>
            {airports && airports.length > 0 ? (
              airports.map((airport) => (
                <Cmdk.CommandItem
                  key={airport._id}
                  value={airport.iataCode}
                  onSelect={() => handleSelect(airport.iataCode)}
                  className="flex flex-col items-start px-3 py-2 cursor-pointer hover:bg-gray-700"
                >
                  <span className="font-mono font-bold text-base">
                    {airport.iataCode}
                  </span>
                  <span className="text-xs text-gray-400">
                    {airport.name} — {airport.city}
                  </span>
                </Cmdk.CommandItem>
              ))
            ) : value.length > 0 ? (
              <Cmdk.CommandEmpty className="px-3 py-2 text-gray-400">
                No airports found
              </Cmdk.CommandEmpty>
            ) : null}
          </Cmdk.CommandList>
        </Cmdk.Command>
      </PopoverContent>
    </Popover>
  );
}
