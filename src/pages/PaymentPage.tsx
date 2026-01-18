import { useState } from "react"
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

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
    })
    const [isProcessing, setIsProcessing] = useState(false)

    // Mock booking data
    const booking = {
        vehicleName: "Express Bus A",
        company: "Laos Express",
        // Use price from param if available, else default
        price: priceParam ? parseInt(priceParam) : 150000,
        duration: "4h 30m",
        departure: "08:00 AM",
        seats: seats ? seats.split(",") : []
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
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

            const seatsList = booking.seats;
            const pricePerSeat = seatsList.length > 0 ? Math.floor(booking.price / seatsList.length) : booking.price;

            // Submit a ticket for each selected seat
            const bookingPromises = seatsList.map(seat => {
                let depTime = new Date().toISOString();
                try {
                    depTime = new Date(`${date} ${booking.departure}`).toISOString();
                } catch (e) { }

                return api.post('/bookings', {
                    busId: id,
                    seatNumber: seat.trim(),
                    departureStation: from,
                    arrivalStation: to,
                    departureTime: depTime,
                    arrivalTime: new Date(new Date(depTime).getTime() + 4 * 60 * 60 * 1000).toISOString(),
                    price: pricePerSeat,
                    passengerDetails: {
                        name: formData.name,
                        age: 30,
                        gender: "other"
                    },
                    paymentMethod: "card"
                })
            });

            const bookingResults = await Promise.all(bookingPromises);

            // Extract booking IDs from the responses
            const bookingIds = bookingResults.map(res => res.data.data._id);
            console.log("Created Booking IDs:", bookingIds);

            // Call PhaJay payment gateway - /api/payment/create-link
            try {
                const paymentRes = await api.post('/payment/create-link', {
                    bookingIds,
                    amount: booking.price,
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
            navigate(`/ticket/${id}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${date}&name=${encodeURIComponent(formData.name)}&seats=${seats}&price=${booking.price}`)
        } catch (err: any) {
            console.error("Booking failed", err)
            console.log("Failed Booking Payload:", { busId: id, from, to, date, seats: booking.seats });

            const errorMessage = err.response?.data?.message || err.message || "Booking failed";
            alert(`Booking Error: ${errorMessage}\nStatus: ${err.response?.status}`);
        } finally {
            setIsProcessing(false)
        }
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
                                                {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Date'} • {booking.departure}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pb-4 border-b border-border">
                                        <p className="text-sm text-muted-foreground">Vehicle</p>
                                        <p className="font-medium text-foreground mt-1">{booking.vehicleName}</p>
                                        <p className="text-xs text-muted-foreground">{booking.company}</p>
                                    </div>

                                    {/* Selected Seats */}
                                    {booking.seats.length > 0 && (
                                        <div className="pb-4 border-b border-border">
                                            <p className="text-sm text-muted-foreground">Selected Seats</p>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {booking.seats.map(seat => (
                                                    <span key={seat} className="inline-block bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                                                        {seat}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm text-muted-foreground">Total Price</p>
                                        <p className="text-2xl font-bold text-primary mt-1">{booking.price.toLocaleString()} LAK</p>
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
