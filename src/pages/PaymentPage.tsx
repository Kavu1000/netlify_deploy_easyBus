import { useState, useEffect } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { ArrowLeft, CreditCard, User, Mail, Phone, MapPin, Calendar, Check } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

import api from "@/api/axios"

export default function PaymentPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const date = searchParams.get("date") || ""
    const vehicleType = searchParams.get("vehicle") || "bus"
    const seats = searchParams.get("seats")
    const priceParam = searchParams.get("price")

    const [bookingDetails, setBookingDetails] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string>("")

    useEffect(() => {
        const fetchSchedule = async () => {
            try {
                // Validate schedule ID format
                if (!id || id.length !== 24) {
                    setError("Invalid schedule ID. Please start your booking from the search page.")
                    setLoading(false)
                    return
                }

                const response = await api.get(`/schedules/${id}`)
                if (response.data.success) {
                    const schedule = response.data.data

                    // Validate that schedule has required bus information
                    if (!schedule.busId) {
                        setError("This schedule is missing bus information. Please try a different schedule or contact support.")
                        setLoading(false)
                        return
                    }

                    const busId = schedule.busId?._id || schedule.busId

                    // Ensure we have a valid bus ID
                    if (!busId) {
                        setError("Unable to retrieve bus details for this schedule. Please try again or select a different bus.")
                        setLoading(false)
                        return
                    }

                    setBookingDetails({
                        ...schedule,
                        busId: busId,
                        vehicleName: schedule.busId?.name || "Bus",
                        company: schedule.busId?.company || "Company",
                        seats: seats ? seats.split(",") : []
                    })
                    setError("") // Clear any previous errors
                } else {
                    setError("Failed to load schedule information. Please try again.")
                }
            } catch (error: any) {
                console.error("Failed to fetch schedule:", error)

                // Provide specific error messages based on error type
                if (error.response?.status === 404) {
                    setError("Schedule not found. This booking may no longer be available.")
                } else if (error.response?.status === 500) {
                    setError("Server error. Please try again later or contact support.")
                } else if (error.message?.includes("Network Error")) {
                    setError("Unable to connect to server. Please check your internet connection.")
                } else {
                    setError("Failed to load schedule information. Please try again or go back to search.")
                }
            } finally {
                setLoading(false)
            }
        }

        if (id) {
            fetchSchedule()
        } else {
            setError("No schedule selected. Please start from the search page.")
            setLoading(false)
        }
    }, [id, seats])

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    })

    // State for individual passenger details for each seat
    const [passengerDetails, setPassengerDetails] = useState<Array<{
        name: string
        age: number | string
        gender: "male" | "female" | "other"
    }>>([])

    // Update passenger details when bookingDetails loads
    useEffect(() => {
        if (bookingDetails?.seats) {
            setPassengerDetails(
                bookingDetails.seats.map((_: any, index: number) => ({
                    name: index === 0 ? "" : "",
                    age: "",
                    gender: "other" as const
                }))
            )
        }
    }, [bookingDetails])

    const [isProcessing, setIsProcessing] = useState(false)

    // Auto-populate first passenger with contact person details when name changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const updatedFormData = { ...formData, [e.target.name]: e.target.value }
        setFormData(updatedFormData)

        // Auto-fill first passenger name from contact person
        if (e.target.name === "name" && passengerDetails.length > 0) {
            const updatedPassengers = [...passengerDetails]
            updatedPassengers[0] = { ...updatedPassengers[0], name: e.target.value }
            setPassengerDetails(updatedPassengers)
        }
    }

    const handlePassengerChange = (index: number, field: string, value: string | number) => {
        const updatedPassengers = [...passengerDetails]
        updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
        setPassengerDetails(updatedPassengers)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!bookingDetails) return

        // Validate required booking data
        if (!bookingDetails.busId) {
            alert("Error: Missing bus information. Please select a different schedule.")
            return
        }

        if (!bookingDetails.seats || bookingDetails.seats.length === 0) {
            alert("Error: No seats selected. Please go back and select your seats.")
            return
        }

        setIsProcessing(true)

        try {
            // -----------------------------------------------------
            // AUTO-LOGIN Workaround for Demo
            // -----------------------------------------------------
            let token = localStorage.getItem('token');
            if (!token) {
                try {
                    const regRes = await api.post('/auth/register', {
                        username: formData.name.replace(/\s+/g, '_').toLowerCase() + Math.floor(Math.random() * 1000),
                        email: formData.email,
                        password: "Password123!",
                        phone: formData.phone,
                        role: "user"
                    });
                    if (regRes.data.success) {
                        token = regRes.data.data.token;
                        localStorage.setItem('token', token);
                    }
                } catch (e) {
                    try {
                        const loginRes = await api.post('/auth/login', {
                            email: formData.email,
                            password: "password123"
                        });
                        if (loginRes.data.success) {
                            token = loginRes.data.data.token;
                            localStorage.setItem('token', token);
                        }
                    } catch (loginErr) {
                        console.error("Auth failed", loginErr);
                        alert("Please Log In first to book a ticket.");
                        setIsProcessing(false);
                        return;
                    }
                }
            }

            const seatsList = bookingDetails.seats;
            const pricePerSeat = bookingDetails.price || 150000;
            const totalPrice = pricePerSeat * seatsList.length;

            // Submit a ticket for each selected seat with individual passenger details
            const bookingPromises = seatsList.map((seat: string, index: number) => {
                let depTime = new Date().toISOString();
                try {
                    // Use schedule departure time if available
                    if (bookingDetails.departureTime) {
                        depTime = bookingDetails.departureTime;
                    } else if (bookingDetails.departure) {
                        // Fallback parsing if string
                        depTime = new Date(`${date} ${bookingDetails.departure}`).toISOString();
                    }
                } catch (e) { }

                const passenger = passengerDetails[index] || passengerDetails[0];

                const payload = {
                    busId: bookingDetails.busId, // Use correct Bus ID from schedule
                    seatNumber: seat.trim(),
                    departureStation: from,
                    arrivalStation: to,
                    departureTime: depTime,
                    arrivalTime: new Date(new Date(depTime).getTime() + (bookingDetails.durationHours || 4) * 60 * 60 * 1000).toISOString(),
                    price: pricePerSeat,
                    passengerDetails: {
                        name: passenger.name || formData.name,
                        age: passenger.age || 30,
                        gender: passenger.gender || "other"
                    },
                    paymentMethod: "card"
                };
                console.log('Sending Booking Payload:', payload); // Debug log

                return api.post('/bookings', payload)
            });

            const bookingResults = await Promise.all(bookingPromises);

            // Extract booking IDs from the responses
            const bookingIds = bookingResults.map(res => res.data.data._id);
            console.log("Created Booking IDs:", bookingIds);

            // Call PhaJay payment gateway - /api/payment/create-link
            try {
                const paymentRes = await api.post('/payment/create-link', {
                    bookingIds,
                    amount: totalPrice,
                    description: `Bus ticket: ${from} to ${to} - Seats: ${seatsList.join(', ')}`
                });

                if (paymentRes.data.success && paymentRes.data.data.redirectURL) {
                    // Redirect to PhaJay payment page
                    window.location.href = paymentRes.data.data.redirectURL;
                    return;
                }
            } catch (paymentErr) {
                console.error("Payment link creation failed:", paymentErr);
                // If payment link fails, still proceed to ticket page (for demo purposes)
            }

            // Fallback: Navigate to ticket page if payment link creation fails
            navigate(`/ticket/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&name=${encodeURIComponent(formData.name)}&seats=${seats}&price=${totalPrice}`)
        } catch (err: any) {
            console.error("Booking failed", err)
            console.log("Failed Booking Payload:", { busId: bookingDetails?.busId, from, to, date, seats: bookingDetails?.seats });

            const errorMessage = err.response?.data?.message || err.message || "Booking failed";
            alert(`Booking Error: ${errorMessage}\nStatus: ${err.response?.status}\n\nPlease try again or contact support if the issue persists.`);
        } finally {
            setIsProcessing(false)
        }
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-background pt-32 flex justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading schedule details...</p>
                </div>
            </main>
        )
    }

    if (error) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-8 mb-6">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">Booking Error</h2>
                            <p className="text-red-700 dark:text-red-300 mb-6">{error}</p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/search')}
                                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Back to Search
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-muted text-foreground px-6 py-3 rounded-xl font-bold hover:bg-muted/80 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        )
    }

    if (!bookingDetails) {
        return (
            <main className="min-h-screen bg-background">
                <Navbar />
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-2xl mx-auto text-center">
                        <p className="text-lg font-semibold text-foreground mb-4">Schedule not found.</p>
                        <p className="text-muted-foreground mb-6">Please start your booking from the search page.</p>
                        <button
                            onClick={() => navigate('/search')}
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Go to Search
                        </button>
                    </div>
                </section>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(`/seats/${id}?vehicle=${vehicleType}&from=${from}&to=${to}&date=${date}`)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Seat Selection
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Booking Summary */}
                        <div className="md:col-span-1 order-1 md:order-2">
                            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm sticky top-32">
                                <h3 className="text-lg font-bold text-foreground mb-4">Trip Summary</h3>

                                <div className="space-y-4">
                                    <div className="pb-4 border-b border-border">
                                        <p className="text-sm text-muted-foreground">Route</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <MapPin className="w-4 h-4 text-primary" />
                                            <p className="font-medium text-foreground">{from} → {to}</p>
                                        </div>
                                    </div>

                                    <div className="pb-4 border-b border-border">
                                        <p className="text-sm text-muted-foreground">Date & Time</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <p className="font-medium text-foreground block">
                                                {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date'} • {bookingDetails.departure || bookingDetails.departureTime}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pb-4 border-b border-border">
                                        <p className="text-sm text-muted-foreground">Vehicle</p>
                                        <p className="font-medium text-foreground mt-1">{bookingDetails.vehicleName}</p>
                                        <p className="text-xs text-muted-foreground">{bookingDetails.company}</p>
                                    </div>

                                    {/* Selected Seats */}
                                    {bookingDetails.seats && bookingDetails.seats.length > 0 && (
                                        <div className="pb-4 border-b border-border">
                                            <p className="text-sm text-muted-foreground">Selected Seats</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {bookingDetails.seats.map((seat: string) => (
                                                    <span key={seat} className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                                                        {seat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Price</p>
                                        <p className="text-2xl font-bold text-primary mt-1">{(bookingDetails.price * (bookingDetails.seats?.length || 1)).toLocaleString()} LAK</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Form */}
                        <div className="md:col-span-2 order-2 md:order-1">
                            <div className="mb-8">
                                <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                                    Step 5 of 5
                                </span>
                                <h1 className="text-3xl font-bold text-foreground mb-2">Confirm Booking</h1>
                                <p className="text-muted-foreground">Please enter your details to complete the booking.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Personal Information */}
                                <div className="bg-card rounded-xl border border-border p-6">
                                    <h3 className="text-lg font-bold text-foreground mb-4">Personal Information</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="Enter your full name"
                                                    className="w-full bg-input/50 text-foreground pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="email@example.com"
                                                        className="w-full bg-input/50 text-foreground pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-foreground mb-2">Phone</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        required
                                                        placeholder="+856 20 XXXX XXXX"
                                                        className="w-full bg-input/50 text-foreground pl-12 pr-4 py-3 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Passenger Details for Each Ticket */}
                                {bookingDetails.seats && bookingDetails.seats.length > 0 && (
                                    <div className="bg-card rounded-xl border border-border p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-bold text-foreground">Passenger Details</h3>
                                            <span className="text-sm text-primary font-semibold bg-primary/10 px-3 py-1 rounded-full">
                                                {bookingDetails.seats.length} Ticket{bookingDetails.seats.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        <div className="space-y-6">
                                            {bookingDetails.seats.map((seat: string, index: number) => (
                                                <div key={seat} className="border border-border rounded-lg p-4 bg-background/50">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <span className="text-sm font-bold text-primary">{seat}</span>
                                                        </div>
                                                        <h4 className="font-semibold text-foreground">
                                                            {index === 0 ? "Main Passenger" : `Passenger ${index + 1}`}
                                                        </h4>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="md:col-span-2">
                                                            <label className="block text-sm font-medium text-foreground mb-2">
                                                                Full Name {index === 0 && <span className="text-muted-foreground text-xs">(Auto-filled from contact)</span>}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={passengerDetails[index]?.name || ""}
                                                                onChange={(e) => handlePassengerChange(index, "name", e.target.value)}
                                                                required
                                                                placeholder="Enter passenger name"
                                                                disabled={index === 0}
                                                                className="w-full bg-input/50 text-foreground px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                                                            />
                                                        </div>

                                                        <div>
                                                            <label className="block text-sm font-medium text-foreground mb-2">Age</label>
                                                            <input
                                                                type="number"
                                                                value={passengerDetails[index]?.age || ""}
                                                                onChange={(e) => handlePassengerChange(index, "age", parseInt(e.target.value) || "")}
                                                                required
                                                                min="1"
                                                                max="120"
                                                                placeholder="Age"
                                                                className="w-full bg-input/50 text-foreground px-4 py-2.5 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                                                            />
                                                        </div>

                                                        <div className="md:col-span-3">
                                                            <label className="block text-sm font-medium text-foreground mb-2">Gender</label>
                                                            <div className="flex gap-3">
                                                                {["male", "female", "other"].map((g) => (
                                                                    <label key={g} className="flex items-center gap-2 cursor-pointer">
                                                                        <input
                                                                            type="radio"
                                                                            name={`gender-${index}`}
                                                                            value={g}
                                                                            checked={passengerDetails[index]?.gender === g}
                                                                            onChange={(e) => handlePassengerChange(index, "gender", e.target.value)}
                                                                            className="w-4 h-4 text-primary focus:ring-primary"
                                                                        />
                                                                        <span className="text-sm text-foreground capitalize">{g}</span>
                                                                    </label>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-primary/40 transition-all disabled:opacity-70"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            Processing Booking...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Confirm Booking
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
