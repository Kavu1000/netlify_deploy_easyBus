
import { useState, useEffect, useMemo } from "react"
import { MapPin, Clock, Star, Phone, Filter, ChevronDown, Wifi, Snowflake, Plug, Calendar, Banknote, Bus } from "lucide-react"
import api from "../services/api"

function timeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const [time, period] = timeStr.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + minutes
}

export default function BusListing({ searchParams }) {
    const [schedules, setSchedules] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const [filters, setFilters] = useState({
        priceRange: "all",
        rating: "all",
        amenities: [],
        departureTime: "all",
        travelDate: "",
    })
    const [sortBy, setSortBy] = useState("departure")

    useEffect(() => {
        fetchSchedules();
    }, [searchParams]);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/schedules');
            const fetchedSchedules = response.data.data.map(schedule => ({
                id: schedule._id,
                scheduleId: schedule._id, // Keep track of schedule ID
                busId: schedule.busId?._id,
                name: schedule.busId?.name || 'Unknown Bus',
                company: schedule.busId?.company || 'Unknown Company',
                phone: schedule.busId?.phone || 'N/A',
                pricePerSeat: schedule.pricePerSeat || 0,
                from: schedule.route.from,
                to: schedule.route.to,
                departure: schedule.departureTime,
                arrival: schedule.arrivalTime,
                duration: schedule.duration,
                price: schedule.price,
                seats: schedule.availableSeats,
                image: "/luxury-coach-bus-tinted-windows.jpg", // Placeholder
                amenities: ["wifi", "ac", "charging"], // Default amenities
                type: "Luxury", // Default type
                date: new Date(schedule.date).toISOString().split('T')[0],
                rating: 4.5 // Default rating
            }));
            setSchedules(fetchedSchedules);
            setLoading(false);
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
            setError("Failed to load schedules. Please try again.");
            setLoading(false);
        }
    };

    const filteredBuses = useMemo(() => {
        let result = [...schedules]

        if (searchParams.from) {
            result = result.filter((bus) => bus.from.toLowerCase().includes(searchParams.from.toLowerCase()))
        }

        if (searchParams.to) {
            result = result.filter((bus) => bus.to.toLowerCase().includes(searchParams.to.toLowerCase()))
        }

        const selectedDate = filters.travelDate || searchParams.date
        if (selectedDate) {
            result = result.filter((bus) => bus.date === selectedDate)
        }

        if (filters.departureTime !== "all") {
            result = result.filter((bus) => {
                const departureMinutes = timeToMinutes(bus.departure)
                switch (filters.departureTime) {
                    case "early-morning": // 12:00 AM - 6:00 AM
                        return departureMinutes >= 0 && departureMinutes < 360
                    case "morning": // 6:00 AM - 12:00 PM
                        return departureMinutes >= 360 && departureMinutes < 720
                    case "afternoon": // 12:00 PM - 6:00 PM
                        return departureMinutes >= 720 && departureMinutes < 1080
                    case "evening": // 6:00 PM - 12:00 AM
                        return departureMinutes >= 1080 && departureMinutes < 1440
                    default:
                        return true
                }
            })
        }

        if (filters.priceRange !== "all") {
            if (filters.priceRange === "low") {
                result = result.filter((bus) => bus.price < 30)
            } else if (filters.priceRange === "medium") {
                result = result.filter((bus) => bus.price >= 30 && bus.price < 80)
            } else if (filters.priceRange === "high") {
                result = result.filter((bus) => bus.price >= 80)
            }
        }



        if (filters.rating !== "all") {
            const minRating = Number.parseFloat(filters.rating)
            result = result.filter((bus) => bus.rating >= minRating)
        }

        if (filters.amenities.length > 0) {
            result = result.filter((bus) => filters.amenities.every((amenity) => bus.amenities.includes(amenity)))
        }

        if (sortBy === "price") {
            result.sort((a, b) => a.price - b.price)
        } else if (sortBy === "rating") {
            result.sort((a, b) => b.rating - a.rating)
        } else if (sortBy === "duration") {
            result.sort((a, b) => {
                const getDuration = (d) => {
                    const parts = d.split("h ")
                    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1])
                }
                return getDuration(a.duration) - getDuration(b.duration)
            })
        } else if (sortBy === "departure") {
            result.sort((a, b) => timeToMinutes(a.departure) - timeToMinutes(b.departure))
        }

        return result
    }, [searchParams, filters, sortBy, schedules])

    const toggleAmenity = (amenity) => {
        setFilters((prev) => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter((a) => a !== amenity)
                : [...prev.amenities, amenity],
        }))
    }

    const clearFilters = () => {
        setFilters({
            priceRange: "all",
            rating: "all",
            amenities: [],
            departureTime: "all",
            travelDate: "",
        })
    }

    if (loading) {
        return (
            <section className="py-20 px-4 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Loading schedules...</p>
            </section>
        );
    }

    if (error) {
        return (
            <section className="py-20 px-4 text-center">
                <p className="text-red-500">{error}</p>
                <button onClick={fetchSchedules} className="mt-4 text-primary hover:underline">Try Again</button>
            </section>
        );
    }

    return (
        <section id="buses" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background to-muted/40 relative z-20">
            {/* Animated background elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
                    <div className="space-y-2">
                        <h2 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent drop-shadow-sm">Available Buses</h2>
                        <p className="text-muted-foreground mt-3 text-lg font-medium">Discover comfortable, affordable, and reliable bus services</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`group flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-all duration-400 border-2 relative overflow-hidden ${showFilters
                                ? "bg-gradient-to-r from-primary via-blue-500 to-cyan-500 text-white border-primary shadow-xl shadow-primary/50 scale-105 hover:shadow-2xl"
                                : "bg-gradient-to-br from-card to-card/70 text-foreground border-primary/30 hover:border-primary/70 hover:bg-gradient-to-br hover:from-primary/10 hover:to-blue-400/10 hover:shadow-xl hover:shadow-primary/20"
                                }`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"></div>
                            <Filter className={`w-5 h-5 transition-all duration-400 group-hover:scale-125 ${showFilters ? "rotate-12 scale-110" : ""}`} />
                            <span className="relative">Filters</span>
                            <ChevronDown className={`w-4 h-4 transition-all duration-400 ${showFilters ? "rotate-180 scale-110" : ""}`} />
                        </button>
                    </div>
                </div>

                {showFilters && (
                    <div className="mb-40 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                        <div className="bg-gradient-to-br from-card via-card/80 to-card/50 rounded-2xl p-8 border-2 border-primary/30 shadow-2xl shadow-primary/20 backdrop-blur-xl overflow-visible relative">
                            {/* Decorative gradient background */}
                            <div className="absolute inset-0 -z-10">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-500/10 to-transparent rounded-full blur-3xl"></div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                                {/* Date Filter */}
                                <div className="group/item">
                                    <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2 group-hover/item:text-primary transition-all duration-300">
                                        <Calendar className="w-5 h-5 text-primary group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300" />
                                        <span>Travel Date</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.travelDate}
                                        onChange={(e) => setFilters({ ...filters, travelDate: e.target.value })}
                                        className="w-full bg-gradient-to-br from-input/50 to-input text-foreground px-4 py-3 rounded-xl border-2 border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 placeholder-muted-foreground/50 font-medium group-hover/item:bg-gradient-to-br group-hover/item:from-primary/5 group-hover/item:to-blue-400/5"
                                    />
                                </div>

                                {/* Departure Time Filter */}
                                <div className="group/item relative z-50">
                                    <CustomSelect
                                        label="Departure Time"
                                        icon={Clock}
                                        value={filters.departureTime}
                                        onChange={(value) => setFilters({ ...filters, departureTime: value })}
                                        options={[
                                            { value: "all", label: "All Times" },
                                            { value: "morning", label: "Morning (6AM - 12PM)" },
                                            { value: "afternoon", label: "Afternoon (12PM - 6PM)" },
                                            { value: "evening", label: "Evening (6PM - 12AM)" },
                                        ]}
                                    />
                                </div>

                                {/* Price Range Filter */}
                                <div className="group/item relative z-40">
                                    <CustomSelect
                                        label="Price Range"
                                        icon={Banknote}
                                        value={filters.priceRange}
                                        onChange={(value) => setFilters({ ...filters, priceRange: value })}
                                        options={[
                                            { value: "all", label: "All Prices" },
                                            { value: "low", label: "Budget (Under 150,000 LAK)" },
                                            { value: "medium", label: "Standard (150,000 - 250,000 LAK)" },
                                            { value: "high", label: "Premium (Above 300,000 LAK)" },
                                        ]}
                                    />
                                </div>


                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t-2 border-primary/20">
                                <button
                                    onClick={clearFilters}
                                    className="group/btn text-sm font-bold text-muted-foreground hover:text-foreground bg-gradient-to-r hover:from-red-500/20 hover:to-red-400/20 px-4 py-2.5 rounded-lg transition-all duration-300 border border-transparent hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/20 active:scale-95 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-400/0 group-hover/btn:from-red-500/20 group-hover/btn:to-red-400/20 transition-all duration-300"></div>
                                    <span className="relative">✕ Clear all filters</span>
                                </button>
                                <span className="text-xs font-bold text-white bg-gradient-to-r from-primary via-blue-500 to-cyan-500 px-4 py-2.5 rounded-lg shadow-lg shadow-primary/30 border border-primary/40">
                                    {filteredBuses.length} buses available
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="text-muted-foreground mb-4">
                    Showing {filteredBuses.length} buses
                    {filters.travelDate && (
                        <span className="ml-2 text-primary">
                            for{" "}
                            {new Date(filters.travelDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    )}
                    {filters.departureTime !== "all" && (
                        <span className="ml-2 text-primary">({filters.departureTime.replace("-", " ")})</span>
                    )}
                </div>

                <div className="space-y-4">
                    {filteredBuses.map((bus) => (
                        <BusCard key={bus.id} bus={bus} />
                    ))}

                    {filteredBuses.length === 0 && (
                        <div className="bg-card rounded-xl p-12 text-center border border-border">
                            <p className="text-muted-foreground text-lg">
                                No buses found matching your criteria. Try adjusting your filters.
                            </p>
                            <button onClick={clearFilters} className="mt-4 text-primary hover:underline">
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

function BusCard({ bus }) {
    return (
        <div className="group bg-gradient-to-br from-card via-card/85 to-card/50 rounded-2xl border-2 border-primary/20 overflow-hidden hover:border-primary/60 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:scale-102 relative">
            {/* Shine effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row h-full">
                <div className="lg:w-72 h-48 lg:h-auto relative overflow-hidden group/img">
                    <img src={bus.image || "/placeholder.svg"} alt={bus.name} className="w-full h-full object-cover group-hover/img:scale-125 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-transparent group-hover/img:from-background/10 transition-all duration-500"></div>
                </div>

                <div className="flex-1 p-8">
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                <h3 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-blue-400 bg-clip-text text-transparent drop-shadow-sm">{bus.name}</h3>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-primary/30 to-blue-400/30 text-primary text-xs font-bold rounded-full border-2 border-primary/40 shadow-md shadow-primary/20">{bus.type}</span>
                            </div>
                            <p className="text-primary font-bold text-sm">{bus.company}</p>
                            {bus.pricePerSeat > 0 && (
                                <p className="text-muted-foreground text-sm flex items-center gap-2">
                                    <span className="font-semibold">Base Price:</span>
                                    <span className="text-primary font-bold">{bus.pricePerSeat} LAK/seat</span>
                                </p>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground text-sm mt-2 hover:text-foreground transition-colors duration-300">
                                <Phone className="w-4 h-4 text-primary" />
                                {bus.phone}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 my-6 bg-gradient-to-r from-primary/10 to-blue-400/10 p-5 rounded-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="text-foreground font-bold">{bus.from}</span>
                        </div>

                        <div className="flex-1 border-t-2 border-dashed border-primary/30 relative">
                            <div className="absolute left-1/2 -translate-x-1/2 -top-4 bg-card px-3 flex items-center gap-1.5 text-primary text-sm font-bold bg-gradient-to-r from-primary/10 to-blue-400/10 border border-primary/20 rounded-full">
                                <Clock className="w-4 h-4" />
                                {bus.duration}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            <span className="text-foreground font-bold">{bus.to}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div className="bg-gradient-to-br from-primary/10 to-blue-400/10 p-4 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Departure</p>
                            <p className="text-foreground font-bold text-lg mt-1">{bus.departure}</p>
                        </div>
                        <div className="bg-gradient-to-br from-primary/10 to-blue-400/10 p-4 rounded-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-wide">Arrival</p>
                            <p className="text-foreground font-bold text-lg mt-1">{bus.arrival}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 bg-gradient-to-r from-muted/50 to-muted/30 p-3.5 rounded-lg border border-primary/10 hover:border-primary/30 transition-all duration-300">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="font-bold">
                            {new Date(bus.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </span>
                    </div>
                </div>

                <div className="lg:w-64 p-8 bg-gradient-to-br from-primary/20 via-blue-400/10 to-primary/5 flex flex-col justify-between items-stretch gap-6 border-t-2 lg:border-t-0 lg:border-l-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                    <div className="text-center w-full space-y-2">
                        {/* Price removed as requested */}
                    </div>

                    <div className="w-full">
                        <p className="text-green-400 text-sm font-bold text-center bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-3 rounded-lg border-2 border-green-500/30 hover:border-green-500/60 transition-all duration-300 hover:shadow-lg hover:shadow-green-500/20">
                            {bus.seats} seats available
                        </p>
                    </div>

                    <button
                        onClick={() => window.location.href = `/booking/${bus.scheduleId}`}
                        className="group/book w-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 text-white py-4 px-6 rounded-xl font-bold text-base hover:shadow-2xl hover:shadow-primary/50 transition-all duration-400 hover:scale-110 active:scale-95 border-2 border-primary/30 hover:border-primary/60 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/book:opacity-100 transition-opacity duration-300"></div>
                        <span className="relative flex items-center justify-center gap-2">
                            Book Now
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}

function CustomSelect({ label, icon: Icon, value, onChange, options }) {
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options.find((opt) => opt.value === value)

    return (
        <div className="relative">
            <label className="block text-sm font-bold text-foreground mb-3 flex items-center gap-2 group-hover/item:text-primary transition-all duration-300">
                <Icon className="w-5 h-5 text-primary group-hover/item:scale-125 group-hover/item:rotate-12 transition-all duration-300" />
                <span>{label}</span>
            </label>

            <button
                onClick={() => setIsOpen(!isOpen)}
                onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                className="w-full bg-gradient-to-br from-gray-900/70 to-blue-950/70 text-blue-200 px-4 py-3 rounded-xl border-2 border-blue-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:border-blue-600/70 hover:shadow-xl hover:shadow-blue-900/50 cursor-pointer font-bold group-hover/item:bg-gradient-to-br group-hover/item:from-blue-900/80 group-hover/item:to-blue-950/90 flex justify-between items-center text-left"
            >
                <span>{selectedOption ? selectedOption.label : "Select"}</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-blue-950 border-2 border-blue-700/50 rounded-xl overflow-y-auto max-h-80 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={`w-full text-left px-4 py-3 text-blue-200 hover:bg-blue-900/50 transition-colors font-medium flex items-center justify-between ${value === option.value ? "bg-blue-900/30 text-blue-100" : ""
                                }`}
                        >
                            {option.label}
                            {value === option.value && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
