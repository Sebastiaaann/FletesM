import React, { useState, useEffect } from 'react';
import { analyzeRouteRisks } from '../services/geminiService';
import { MapPin, Navigation, AlertTriangle, Activity } from 'lucide-react';

const FleetTracking: React.FC = () => {
    const [analysis, setAnalysis] = useState<string>("");
    const [loading, setLoading] = useState(false);

    // Mock Data
    const trucks = [
        { id: "TRK-882", location: "Dallas, TX", status: "In Transit", destination: "Austin, TX", load: 85 },
        { id: "TRK-104", location: "Reno, NV", status: "Warning", destination: "Sacramento, CA", load: 40 },
        { id: "TRK-339", location: "Miami, FL", status: "In Transit", destination: "Orlando, FL", load: 92 },
    ];

    const handleAnalyze = async (origin: string, dest: string) => {
        setLoading(true);
        const res = await analyzeRouteRisks(origin, dest);
        setAnalysis(res);
        setLoading(false);
    };

    useEffect(() => {
        // Initial analysis for the warning truck
        handleAnalyze("Reno, NV", "Sacramento, CA");
    }, []);

    return (
        <div className="min-h-screen pt-24 px-4 bg-slate-950">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white">Fleet Command Center</h2>
                        <p className="text-slate-400">Real-time telemetry and AI risk assessment.</p>
                    </div>
                    <div className="flex items-center gap-2 text-green-400 bg-green-900/20 px-4 py-2 rounded-full border border-green-900/50 animate-pulse">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs font-mono font-bold">SYSTEM ONLINE</span>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: List */}
                    <div className="col-span-1 space-y-4">
                        {trucks.map((truck) => (
                            <div 
                                key={truck.id} 
                                onClick={() => handleAnalyze(truck.location, truck.destination)}
                                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                                    truck.status === 'Warning' 
                                    ? 'bg-red-950/10 border-red-500/50 hover:bg-red-900/20' 
                                    : 'bg-slate-900 border-slate-800 hover:border-brand-500/50 hover:bg-slate-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-white font-mono font-bold">{truck.id}</h3>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                        truck.status === 'Warning' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                                    }`}>{truck.status}</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <MapPin className="w-4 h-4" /> {truck.location}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Navigation className="w-4 h-4" /> {truck.destination}
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                                        <span>Load Capacity</span>
                                        <span>{truck.load}%</span>
                                    </div>
                                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                                        <div 
                                            className={`h-1.5 rounded-full ${truck.load > 90 ? 'bg-red-500' : 'bg-brand-500'}`} 
                                            style={{ width: `${truck.load}%`}}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Column: Map/Analysis Panel */}
                    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[600px]">
                        {/* Mock Map Visualization */}
                        <div className="flex-1 bg-slate-950 rounded-xl relative overflow-hidden mb-6 group">
                             <img 
                                src="https://picsum.photos/800/400?grayscale" 
                                alt="Map" 
                                className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000"
                             />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                             
                             {/* Overlay UI */}
                             <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="bg-slate-950/80 backdrop-blur-md p-4 rounded-lg border border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current Analysis Focus</p>
                                    <div className="text-white font-mono flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-brand-400" />
                                        Route Optimization v2.5
                                    </div>
                                </div>
                             </div>
                        </div>

                        {/* AI Analysis Output */}
                        <div className="h-auto min-h-[150px] bg-slate-950/50 rounded-xl border border-slate-800 p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">AI</span>
                                </div>
                                <span className="text-slate-300 font-semibold text-sm">Gemini Risk Assessment</span>
                            </div>
                            
                            {loading ? (
                                <div className="flex items-center gap-2 text-slate-500 text-sm animate-pulse">
                                    <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                                    Analyzing route conditions...
                                </div>
                            ) : (
                                <div className="flex gap-3 items-start">
                                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {analysis || "Select a vehicle to run route analysis."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FleetTracking;