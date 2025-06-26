"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";

interface Airport {
  id: string;
  name: string;
  iata_code: string;
  municipality: string;
  iso_country: string;
}

interface AutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

export function Autocomplete({ value, onChange, placeholder, className }: AutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const airports = useQuery(api.queries.searchAirports, {
    searchTerm: searchTerm || value,
    limit: 10
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
    setSelectedAirport(null);
  };

  const handleAirportSelect = (airport: Airport) => {
    setSelectedAirport(airport);
    onChange(airport.iata_code);
    setSearchTerm(airport.iata_code);
    setIsOpen(false);
  };

  const displayValue = selectedAirport ? selectedAirport.iata_code : value;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className={cn(
          "flex-1 h-9 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-1 text-sm text-white shadow-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-yellow-400 focus-visible:border-yellow-400 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
      
      {isOpen && airports && airports.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {airports.map((airport: Airport) => (
            <button
              key={airport.id}
              onClick={() => handleAirportSelect(airport)}
              className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-yellow-400"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-yellow-400">{airport.iata_code}</span>
                  <span className="text-gray-300 text-xs">{airport.name}</span>
                  <span className="text-gray-400 text-xs">
                    {airport.municipality ? `${airport.municipality}, ${airport.iso_country}` : airport.iso_country}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 