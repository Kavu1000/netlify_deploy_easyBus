
import { useState } from "react"
import { MapPin, Calendar, Search, Bus, Car, Bike } from "lucide-react"

const vehicleTypes = [
    { id: "bus", name: "Bus", icon: Bus, description: "Comfortable long-distance travel" },
    { id: "van", name: "Van", icon: Car, description: "Flexible group transport" },
    { id: "tuktuk", name: "TukTuk", icon: Bike, description: "Quick city rides" },
]

export default function HeroSection({ onSearch }) {
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])
    const [vehicleType, setVehicleType] = useState("bus")

    const handleSearch = () => {
        onSearch({ from, to, date, vehicleType })
        const busesSection = document.getElementById("buses")
        if (busesSection) {
            busesSection.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/95 to-background min-h-screen flex items-center">
            <div className="max-w-5xl mx-auto w-full">
                <div className="text-center mb-12">
                    <div className="inline-block mb-4">
                        <span className="text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full"></span>
                    </div>
                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 text-balance bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent">
                        Book Your Ride with Ease
                    </h1>
                    <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
                        Find the best buses, vans, and tuktuks. Compare prices and book your tickets in minutes with BusGoGo.
                    </p>
                </div>

                <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border border-primary/10 shadow-2xl shadow-primary/10 backdrop-blur">
                    {/* Vehicle Type Selector */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-foreground mb-3">Choose Vehicle Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {vehicleTypes.map((vehicle) => {
                                const Icon = vehicle.icon
                                const isSelected = vehicleType === vehicle.id
                                return (
                                    <button
                                        key={vehicle.id}
                                        onClick={() => setVehicleType(vehicle.id)}
                                        className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group ${isSelected
                                                ? "bg-primary/10 border-primary shadow-lg shadow-primary/20"
                                                : "bg-input/30 border-border hover:border-primary/50 hover:bg-input/50"
                                            }`}
                                    >
                                        <div className={`p-3 rounded-full transition-all duration-300 ${isSelected
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                                            }`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                                            {vehicle.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground text-center hidden sm:block">
                                            {vehicle.description}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            </div>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <button
                        onClick={handleSearch}
                        className="w-full mb-6 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 hover:from-primary hover:to-blue-600 active:scale-95"
                    >
                        <Search className="w-5 h-5" />
                        Search {vehicleTypes.find(v => v.id === vehicleType)?.name || "Rides"}
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-3">From</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                                <input
                                    type="text"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    placeholder="Enter origin"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-10 pr-4 py-3.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-3">To</label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                                <input
                                    type="text"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    placeholder="Enter destination"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-10 pr-4 py-3.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-3">Date</label>
                            <div className="relative group">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary group-hover:text-primary/80 transition-colors" />
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-10 pr-4 py-3.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 font-medium"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

