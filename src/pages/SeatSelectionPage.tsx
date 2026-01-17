import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, User, Armchair, Check, AlertCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import api from "@/api/axios"

// Mock seat configuration
const TOTAL_SEATS = 32
const SEATS_PER_ROW = 4
const AISLE_AFTER_COLUMN = 2

export default function SeatSelectionPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()

    // Get query params to preserve flow
    const vehicleType = searchParams.get("vehicle") || "bus"
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const date = searchParams.get("date") || ""

    const [selectedSeats, setSelectedSeats] = useState<string[]>([])
    const [occupiedSeats, setOccupiedSeats] = useState<string[]>([])
    const [basePrice, setBasePrice] = useState(150000)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSeatData = async () => {
            // If ID is mock/undefined, skip or handle gracefully.
            // Our VehiclesPage passes the real ID now.
            if (!id) return;

            try {
                const response = await api.get(`/buses/${id}/seats`)
                if (response.data.success) {
                    const seats = response.data.data.seats || [];
                    // If seats array doesn't exist, check if bookedSeats exists on the bus object?
                    // API Doc says data has bookedSeats count or array? 
                    // My curl showed data is the bus object.
                    // It might have 'bookedSeats' array of strings?
                    // Let's check both possibilities basically.

                    let booked: string[] = [];
                    if (Array.isArray(seats) && seats.length > 0) {
                        booked = seats.filter((s: any) => s.isBooked).map((s: any) => s.seatNumber)
                    } else if (response.data.data.bookedSeats && Array.isArray(response.data.data.bookedSeats)) {
                        // Fallback if API returns simple bookedSeats array
                        booked = response.data.data.bookedSeats;
                    }

                    setOccupiedSeats(booked)
                }
            } catch (err) {
                console.error("Failed to fetch seats", err)
                // Fallback to empty or mock if backend fails?
                // For now, empty means all available.
            } finally {
                setLoading(false)
            }
        }
        fetchSeatData()
    }, [id])

    const toggleSeat = (seatId: string) => {
        if (occupiedSeats.includes(seatId)) return

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId))
        } else {
            // Limit selection if needed, e.g. max 5 seats
            if (selectedSeats.length >= 5) {
                alert("You can select up to 5 seats only.")
                return
            }
            setSelectedSeats([...selectedSeats, seatId])
        }
    }

    const totalPrice = selectedSeats.length * basePrice

    const handleConfirmSeats = () => {
        if (selectedSeats.length === 0) return

        const seatsParam = selectedSeats.join(",")
        navigate(`/payment/${id}?vehicle=${vehicleType}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&seats=${seatsParam}&price=${totalPrice}`)
    }

    // Generate seats
    const renderSeats = () => {
        const rows = Math.ceil(TOTAL_SEATS / SEATS_PER_ROW)
        const seatElements = []

        for (let r = 1; r <= rows; r++) {
            const rowSeats = []
            for (let c = 0; c < SEATS_PER_ROW; c++) {
                // Column logic: 0=A, 1=B, 2=C, 3=D
                const char = String.fromCharCode(65 + c)
                const seatId = `${r}${char}`
                const isOccupied = occupiedSeats.includes(seatId)
                const isSelected = selectedSeats.includes(seatId)

                rowSeats.push(
                    <button
                        key={seatId}
                        onClick={() => toggleSeat(seatId)}
                        disabled={isOccupied}
                        className={`
                            w-10 h-10 sm:w-12 sm:h-12 rounded-lg m-1 text-sm font-bold flex items-center justify-center transition-all duration-200
                            ${isOccupied
                                ? "bg-muted text-muted-foreground cursor-not-allowed border border-transparent"
                                : isSelected
                                    ? "bg-primary text-white shadow-lg scale-105"
                                    : "bg-white border-2 border-border text-foreground hover:border-primary hover:text-primary"
                            }
                        `}
                    >
                        {isSelected ? <Check className="w-5 h-5" /> : seatId}
                    </button>
                )
            }
            // Add aisle
            rowSeats.splice(AISLE_AFTER_COLUMN, 0, <div key={`aisle-${r}`} className="w-6 sm:w-10 flex items-center justify-center text-xs text-muted-foreground/20 font-bold"></div>)

            seatElements.push(
                <div key={r} className="flex justify-center mb-2">
                    {rowSeats}
                </div>
            )
        }
        return seatElements
    }

    return (
        <main className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <section className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                        <button
                            onClick={() => navigate(`/vehicles?vehicle=${vehicleType}&from=${from}&to=${to}&date=${date}`)}
                            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                <ArrowLeft className="w-4 h-4 group-hover:text-primary" />
                            </div>
                            <span className="font-medium">Back to Vehicles</span>
                        </button>

                        <div className="flex flex-col items-end">
                            <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-2">
                                Step 4 of 5
                            </span>
                            <h1 className="text-2xl font-bold text-foreground">Select Your Seats</h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Seat Map */}
                        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-8 shadow-sm">
                            <div className="flex justify-between items-center mb-8 bg-muted/50 p-4 rounded-xl">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-white border-2 border-border"></div>
                                    <span className="text-sm text-muted-foreground">Available</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-primary"></div>
                                    <span className="text-sm text-foreground font-medium">Selected</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded bg-muted-foreground/30"></div>
                                    <span className="text-sm text-muted-foreground">Occupied</span>
                                </div>
                            </div>

                            {/* Driver indicator */}
                            <div className="flex justify-end mb-8 px-8">
                                <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center text-muted-foreground bg-muted/30">
                                    <User className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Seats Container */}
                            <div className="bg-white/50 rounded-xl p-4 border border-dashed border-border/60">
                                {renderSeats()}
                            </div>
                        </div>

                        {/* Summary Card */}
                        <div className="lg:col-span-1">
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-32">
                                <h3 className="text-lg font-bold text-foreground mb-4">Trip Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Vehicle</span>
                                        <span className="font-medium text-foreground capitalize">{vehicleType}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Seats Selected</span>
                                        <span className="font-medium text-foreground">{selectedSeats.length > 0 ? selectedSeats.join(", ") : "-"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-muted-foreground">Price per seat</span>
                                        <span className="font-medium text-foreground">{basePrice.toLocaleString()} LAK</span>
                                    </div>
                                    <div className="border-t border-border pt-4 flex justify-between items-center">
                                        <span className="text-lg font-bold text-foreground">Total</span>
                                        <span className="text-2xl font-bold text-primary">{totalPrice.toLocaleString()} LAK</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleConfirmSeats}
                                    disabled={selectedSeats.length === 0}
                                    className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5"
                                >
                                    Proceed to Payment
                                </button>

                                {selectedSeats.length === 0 && (
                                    <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Please select at least one seat
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
