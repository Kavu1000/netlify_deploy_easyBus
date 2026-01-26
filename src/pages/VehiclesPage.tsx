import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { MapPin, Clock, ArrowLeft, Bus, Car, Bike, Users, Star } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import api from "@/api/axios"

const vehicleInfo: Record<string, { name: string; icon: any }> = {
    bus: { name: "Bus", icon: Bus },
    van: { name: "Van", icon: Car },
    tuktuk: { name: "TukTuk", icon: Bike },
}

// Mock data for available vehicles
const mockVehicles = [
    { id: "1", name: "Express Bus A", company: "Laos Express", price: 150000, duration: "4h 30m", departure: "08:00 AM", seats: 25, rating: 4.5 },
    { id: "2", name: "Comfort Bus B", company: "VIP Travel", price: 180000, duration: "4h 00m", departure: "09:30 AM", seats: 18, rating: 4.8 },
    { id: "3", name: "Standard Bus C", company: "National Bus", price: 120000, duration: "5h 15m", departure: "11:00 AM", seats: 32, rating: 4.2 },
    { id: "4", name: "Premium Van D", company: "Comfort Ride", price: 250000, duration: "3h 45m", departure: "10:00 AM", seats: 8, rating: 4.9 },
]

export default function VehiclesPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const vehicleType = searchParams.get("vehicle") || "bus"
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const date = searchParams.get("date") || ""

    const vehicle = vehicleInfo[vehicleType] || vehicleInfo.bus
    const Icon = vehicle.icon

    const [vehicles, setVehicles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const fetchBuses = async () => {
            setLoading(true)
            setError("")
            try {
                // Determine bus type for API filter
                // API options: AC, Non-AC, Sleeper, Semi-Sleeper, Luxury
                // Mapping: bus -> AC? Luxury?
                // For now, we fetch all and let user see.
                // Or pass from/to which are more important.

                const response = await api.get('/schedules', {
                    params: {
                        from: from,
                        to: to,
                        date: date // also pass date if available
                    }
                })

                if (response.data.success) {
                    // Map API data to UI format and validate schedule data
                    const mappedVehicles = response.data.data
                        .filter((schedule: any) => {
                            // Only include schedules with valid bus information
                            if (!schedule._id || !schedule.busId) {
                                console.warn('Skipping schedule with missing ID or bus:', schedule)
                                return false
                            }
                            return true
                        })
                        .map((schedule: any) => ({
                            id: schedule._id, // Use Schedule ID so next page gets price/time info
                            name: schedule.busId?.name || `Bus ${schedule.busId?.licensePlate || 'Unknown'}`,
                            company: schedule.busId?.company || "Easy Bus Fleet",
                            price: schedule.price || schedule.pricePerSeat || 150000,
                            duration: schedule.duration || "5h 00m",
                            departure: schedule.departureTime || "08:00 AM",
                            seats: schedule.availableSeats || 40,
                            rating: 4.5
                        }))
                    setVehicles(mappedVehicles)

                    if (mappedVehicles.length === 0) {
                        setError("No valid schedules found for this route. Please try a different search.")
                    }
                } else {
                    setError("Failed to fetch schedules. Please try again.")
                }
            } catch (err: any) {
                console.error("Error fetching schedules:", err)
                if (err.response?.status === 404) {
                    setError("No schedules found for this route. Try different cities or dates.")
                } else if (err.message?.includes("Network Error")) {
                    setError("Cannot connect to server. Please check your internet connection and ensure the backend is running.")
                } else {
                    setError("Failed to load schedules. Please try again later.")
                }
            } finally {
                setLoading(false)
            }
        }

        fetchBuses()
    }, [from, to, vehicleType])

    const handleSelectSeat = (vehicleId: string) => {
        // Validate vehicle/schedule ID before proceeding
        if (!vehicleId || vehicleId.length !== 24) {
            alert("Invalid schedule selected. Please try again.")
            return
        }

        navigate(`/seats/${vehicleId}?vehicle=${vehicleType}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}`)
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(`/search?vehicle=${vehicleType}`)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Search
                    </button>

                    {/* Header */}
                    <div className="mb-10">
                        <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                            Step 3 of 5
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                            Available {vehicle.name}s
                        </h1>

                        {/* Search Summary */}
                        <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span>{from} → {to}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-lg">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>

                    {/* Loading/Error State */}
                    {loading ? (
                        <div className="text-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Finding available {vehicle.name === 'Bus' ? 'buses' : vehicle.name.toLowerCase() + 's'}...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 font-bold">{error}</p>
                            <p className="text-sm text-muted-foreground mt-2">Try checking if the backend server is running.</p>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="text-center py-20 bg-muted/30 rounded-2xl">
                            <p className="text-lg font-bold text-foreground">No vehicles found</p>
                            <p className="text-muted-foreground mt-2">Try different route (e.g. New York to Boston)</p>
                        </div>
                    ) : (
                        /* Vehicle List */
                        <div className="space-y-4">
                            {vehicles.map((v) => (
                                <div
                                    key={v.id}
                                    className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Vehicle Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Icon className="w-7 h-7 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-foreground">{v.name}</h3>
                                                <p className="text-sm text-muted-foreground">{v.company}</p>
                                                <div className="flex items-center gap-3 mt-2">
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                        {v.rating}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                        <Users className="w-4 h-4" />
                                                        {v.seats} seats left
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Time & Duration */}
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <p className="text-lg font-bold text-foreground">{v.departure}</p>
                                                <p className="text-sm text-muted-foreground">{v.duration}</p>
                                            </div>
                                        </div>

                                        {/* Price & Book Button */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-primary">{v.price.toLocaleString()}</p>
                                                <p className="text-sm text-muted-foreground">LAK</p>
                                            </div>
                                            <button
                                                onClick={() => handleSelectSeat(v.id)}
                                                className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors whitespace-nowrap"
                                            >
                                                Select Seat
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    )
}
