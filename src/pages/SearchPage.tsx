import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MapPin, Calendar, Search, Bus, Car, Bike, ArrowLeft } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

const vehicleInfo: Record<string, { name: string; icon: any; color: string }> = {
    bus: { name: "Bus", icon: Bus, color: "from-blue-500 to-blue-600" },
    van: { name: "Van", icon: Car, color: "from-green-500 to-green-600" },
    tuktuk: { name: "TukTuk", icon: Bike, color: "from-orange-500 to-orange-600" },
}

export default function SearchPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const vehicleType = searchParams.get("vehicle") || "bus"
    const vehicle = vehicleInfo[vehicleType] || vehicleInfo.bus
    const Icon = vehicle.icon

    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const [date, setDate] = useState(new Date().toISOString().split("T")[0])

    const handleSearch = () => {
        navigate(`/vehicles?vehicle=${vehicleType}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {/* Top Bar: Back Button, Vehicle Badge, Step Indicator */}
                    <div className="flex flex-col md:grid md:grid-cols-3 items-center gap-4 mb-8 relative">
                        {/* Left: Back Button */}
                        <div className="w-full md:w-auto flex justify-start">
                            <button
                                onClick={() => navigate("/")}
                                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                            >
                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                    <ArrowLeft className="w-4 h-4 group-hover:text-primary" />
                                </div>
                                <span className="font-medium">Back to Vehicle Selection</span>
                            </button>
                        </div>

                        {/* Center: Vehicle Badge */}
                        <div className="flex justify-center w-full md:w-auto order-last md:order-none">
                            <div className={`flex items-center gap-2 bg-gradient-to-r ${vehicle.color} text-white px-6 py-2 rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105`}>
                                <Icon className="w-5 h-5" />
                                <span className="font-bold whitespace-nowrap">Searching for {vehicle.name}</span>
                            </div>
                        </div>

                        {/* Right: Step Indicator */}
                        <div className="w-full md:w-auto flex justify-end">
                            <span className="text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-full whitespace-nowrap">
                                Step 2 of 5
                            </span>
                        </div>
                    </div>

                    {/* Header Text */}
                    <div className="text-center mb-10">
                        <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            Where are you going?
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            Enter your travel details to find available {vehicle.name.toLowerCase()}s
                        </p>
                    </div>

                    {/* Search Form */}
                    <div className="bg-card rounded-2xl border border-border p-8 shadow-xl">
                        <div className="space-y-6">
                            {/* From */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    From
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <input
                                        type="text"
                                        value={from}
                                        onChange={(e) => setFrom(e.target.value)}
                                        placeholder="Enter departure city"
                                        className="w-full bg-input/50 text-foreground pl-12 pr-4 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            {/* To */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    To
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <input
                                        type="text"
                                        value={to}
                                        onChange={(e) => setTo(e.target.value)}
                                        placeholder="Enter destination city"
                                        className="w-full bg-input/50 text-foreground pl-12 pr-4 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-3">
                                    Travel Date
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="w-full bg-input/50 text-foreground pl-12 pr-4 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {/* Search Button */}
                            <button
                                onClick={handleSearch}
                                disabled={!from || !to}
                                className="w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/40 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                            >
                                <Search className="w-5 h-5" />
                                Search Available {vehicle.name}s
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
