import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X, Navigation, Compass } from "lucide-react";
import { cn } from "@/utils/cn";

interface Suggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  label: string;
  placeholder?: string;
  onSelect: (data: { address: string; lat: number; lng: number }) => void;
  className?: string;
  value?: string;
  showCurrentLocation?: boolean;
}

export function LocationSearch({ label, placeholder, onSelect, className, value = "", showCurrentLocation = false }: LocationSearchProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchSuggestions = async (text: string) => {
    if (text.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=in&limit=6&addressdetails=1`
      );
      const data = await response.json();
      setSuggestions(data);
      setIsOpen(true);
    } catch (error) {
      console.error("Geocoding failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 500);
  };

  const handleSelect = (s: Suggestion) => {
    setQuery(s.display_name);
    setSuggestions([]);
    setIsOpen(false);
    onSelect({
      address: s.display_name,
      lat: parseFloat(s.lat),
      lng: parseFloat(s.lon)
    });
  };

  const useCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            const data = await response.json();
            const address = data.display_name;
            setQuery(address);
            onSelect({ address, lat: latitude, lng: longitude });
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
    }
  };

  return (
    <div className={cn("relative space-y-2", className)} ref={containerRef}>
      <div className="flex justify-between items-center px-4">
        <div className="flex items-center space-x-2">
           <Compass size={10} className="text-slate-400" />
           <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</label>
        </div>
        {showCurrentLocation && (
          <button
            type="button"
            onClick={useCurrentLocation}
            className="text-[9px] flex items-center text-amber-600 hover:text-amber-700 font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 group/loc"
            disabled={isLocating}
          >
            {isLocating ? (
              <Loader2 size={10} className="animate-spin mr-1.5" />
            ) : (
              <Navigation size={10} className="mr-1.5 fill-amber-600/10 group-hover/loc:fill-amber-600/30 transition-colors" />
            )}
            Use Current Terminal
          </button>
        )}
      </div>
      <div className="relative group/input">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400 group-focus-within/input:text-amber-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => query.length >= 3 && setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full h-14 pl-14 pr-12 bg-white border-2 border-slate-100 rounded-[1.25rem] text-[13px] font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:shadow-lg focus:shadow-amber-500/5 transition-all"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-5 flex items-center">
            <Loader2 size={16} className="animate-spin text-amber-500" />
          </div>
        )}
        {!isLoading && query && (
          <button
            type="button"
            onClick={() => { setQuery(""); setSuggestions([]); setIsOpen(false); }}
            className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
          >
            <X size={16} />
          </button>
        )}
        {/* Glow effect on focus */}
        <div className="absolute inset-0 -z-10 bg-amber-500/10 blur-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity rounded-full"></div>
      </div>

      {isOpen && (
        <div className="absolute z-[9999] w-full mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-900/10 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-8 ring-slate-50/50">
          <div className="bg-slate-900 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
             <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">Global Terminal Registry</span>
             </div>
             <span className="text-[8px] font-bold text-slate-500 uppercase">OSRM Verified</span>
          </div>

          {suggestions.length === 0 && !isLoading ? (
             <div className="p-8 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No registry matches found</p>
             </div>
          ) : (
            <ul className="max-h-72 overflow-auto py-2 custom-scrollbar">
              {suggestions.map((s) => (
                <li
                  key={s.place_id}
                  onClick={() => handleSelect(s)}
                  className="px-5 py-4 hover:bg-slate-50 cursor-pointer flex items-start space-x-4 transition-all border-b border-slate-50 last:border-0 group/item"
                >
                  <div className="mt-0.5 p-2 bg-slate-100 rounded-xl text-slate-400 group-hover/item:bg-amber-500 group-hover/item:text-slate-950 transition-all shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div className="flex flex-col min-w-0">
                     <span className="text-[12px] font-bold text-slate-700 leading-tight group-hover/item:text-slate-900 transition-colors line-clamp-2">{s.display_name}</span>
                     <div className="flex items-center space-x-2 mt-1.5">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest group-hover/item:text-amber-600 transition-colors">Grid Matched</span>
                        <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                        <span className="text-[8px] font-bold text-slate-400">LAT: {parseFloat(s.lat).toFixed(4)}</span>
                     </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="bg-slate-50 px-5 py-2 border-t border-slate-100">
             <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">Select accurate terminal for precise vector calculation</p>
          </div>
        </div>
      )}
    </div>
  );
}
