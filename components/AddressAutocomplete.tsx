import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search } from 'lucide-react';

interface AddressAutocompleteProps {
    label: string;
    value: string;
    onChange: (value: string, coords?: [number, number]) => void;
    placeholder?: string;
    error?: string;
}

// Mock Database of Chilean Logistics Hubs
const MOCK_LOCATIONS = [
    { name: 'Santiago Centro', coords: [-33.4489, -70.6693] },
    { name: 'Santiago, Pudahuel (Aeropuerto)', coords: [-33.3930, -70.7858] },
    { name: 'Santiago, Quilicura (Industrial)', coords: [-33.3667, -70.7333] },
    { name: 'Valparaíso Puerto', coords: [-33.0472, -71.6127] },
    { name: 'San Antonio Puerto', coords: [-33.5933, -71.6128] },
    { name: 'Concepción', coords: [-36.8201, -73.0444] },
    { name: 'Talcahuano Puerto', coords: [-36.7167, -73.1167] },
    { name: 'Antofagasta', coords: [-23.6500, -70.4000] },
    { name: 'Calama', coords: [-22.4544, -68.9292] },
    { name: 'Puerto Montt', coords: [-41.4693, -72.9424] },
    { name: 'Arica', coords: [-18.4783, -70.3126] },
    { name: 'Iquique', coords: [-20.2307, -70.1357] },
    { name: 'La Serena', coords: [-29.9027, -71.2520] },
    { name: 'Coquimbo', coords: [-29.9533, -71.3436] },
    { name: 'Rancagua', coords: [-34.1708, -70.7444] },
    { name: 'Talca', coords: [-35.4264, -71.6554] },
    { name: 'Temuco', coords: [-38.7359, -72.5904] },
    { name: 'Osorno', coords: [-40.5739, -73.1335] },
    { name: 'Punta Arenas', coords: [-53.1638, -70.9171] },
];

const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({ label, value, onChange, placeholder, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState(value);
    const [filtered, setFiltered] = useState(MOCK_LOCATIONS);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setQuery(value);
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const text = e.target.value;
        setQuery(text);
        onChange(text); // Update parent with raw text immediately

        if (text.length > 0) {
            const matches = MOCK_LOCATIONS.filter(loc =>
                loc.name.toLowerCase().includes(text.toLowerCase())
            );
            setFiltered(matches);
            setIsOpen(true);
        } else {
            setIsOpen(false);
        }
    };

    const handleSelect = (location: { name: string; coords: number[] }) => {
        setQuery(location.name);
        onChange(location.name, location.coords as [number, number]);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    onFocus={() => query.length > 0 && setIsOpen(true)}
                    className={`w-full bg-dark-900 border rounded-xl px-4 py-3 pl-10 text-white focus:ring-2 focus:ring-brand-500 outline-none transition-colors placeholder-slate-600 ${error ? 'border-red-500/50' : 'border-white/10'}`}
                    placeholder={placeholder || "Buscar dirección..."}
                />
                <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            </div>

            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

            {isOpen && filtered.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-dark-800 border border-white/10 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                    {filtered.map((loc, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSelect(loc)}
                            className="w-full text-left px-4 py-3 hover:bg-white/5 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0"
                        >
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-4 h-4 text-brand-500" />
                            </div>
                            <div>
                                <p className="text-sm text-white font-medium">{loc.name}</p>
                                <p className="text-xs text-slate-500">Chile</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AddressAutocomplete;
