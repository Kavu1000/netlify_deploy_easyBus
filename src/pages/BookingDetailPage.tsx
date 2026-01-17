
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { MapPin, Clock, Calendar, Bus, User, CreditCard, Check, Lock, Minus, Plus, ArrowLeft } from "lucide-react"
import api from "../services/api"
import { useAuth } from "../contexts/AuthContext"

export default function BookingDetailPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [schedule, setSchedule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Booking State
    const [passengers, setPassengers] = useState(1)
    const [passengerDetails, setPassengerDetails] = useState([{ name: "", email: "", phone: "" }])

    // Payment State
    const [processing, setProcessing] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)

    useEffect(() => {
        fetchScheduleDetails()
    }, [id])

    const fetchScheduleDetails = async () => {
        try {
            setLoading(true)
            const response = await api.get(`/schedules/${id}`)
            setSchedule(response.data.data)
        } catch (err) {
            console.error("Failed to fetch schedule:", err)
            setError("Failed to load schedule details. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const handlePassengerChange = (count) => {
        if (count < 1 || (schedule && count > schedule.availableSeats)) return
        setPassengers(count)

        if (count > passengerDetails.length) {
            const newDetails = [...passengerDetails]
            for (let i = passengerDetails.length; i < count; i++) {
                newDetails.push({ name: "", email: "", phone: "" })
            }
            setPassengerDetails(newDetails)
        } else {
            setPassengerDetails(passengerDetails.slice(0, count))
        }
    }

    const updatePassengerDetail = (index, field, value) => {
        const newDetails = [...passengerDetails]
        newDetails[index][field] = value
        setPassengerDetails(newDetails)
    }

    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Redirect to login with return url
            navigate('/login', { state: { from: `/booking/${id}` } });
            return;
        }

        // Validate passenger details
        const isValid = passengerDetails.every(p => p.name && p.phone);
        if (!isValid) {
            setError("Please fill in all passenger details (Name and Phone are required)");
            return;
        }

        setProcessing(true)
        setError(null)

        try {
            // Create bookings first
            const bookingPromises = passengerDetails.map((passenger, index) => {
                // Construct departure Date object
                const dateStr = new Date(schedule.date).toISOString().split('T')[0];
                const timeStr = schedule.departureTime;

                let departureDate = new Date();
                if (dateStr && timeStr) {
                    const [time, period] = timeStr.split(' ');
                    let [hours, minutes] = time.split(':');
                    hours = parseInt(hours);
                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;

                    departureDate = new Date(dateStr);
                    departureDate.setHours(hours, parseInt(minutes), 0, 0);
                }

                return api.post('/bookings', {
                    busId: schedule.busId._id,
                    seatNumber: `A${index + 1}`, // Auto-assign seat logic would go here
                    departureStation: schedule.route.from,
                    arrivalStation: schedule.route.to,
                    departureTime: departureDate,
                    price: schedule.price,
                    passengerDetails: {
                        name: passenger.name,
                        email: passenger.email,
                        phone: passenger.phone
                    },
                    paymentMethod: 'phapay',
                    paymentStatus: 'pending'
                });
            });

            const bookingResponses = await Promise.all(bookingPromises);
            const bookingIds = bookingResponses.map(res => res.data.data._id);

            // Generate LAPNet payment link
            const paymentResponse = await api.post('/payment/create-link', {
                bookingIds,
                amount: schedule.price * passengers,
                description: `Bus ticket: ${schedule.route.from} to ${schedule.route.to}`
            });

            // Redirect to LAPNet payment page
            window.location.href = paymentResponse.data.data.redirectURL;

        } catch (err) {
            console.error("Booking failed:", err);
            setError(err.response?.data?.message || "Booking failed. Please try again.");
            setProcessing(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background pt-24 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (error && !schedule) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="text-primary hover:underline">
                        Return to Home
                    </button>
                </div>
            </div>
        )
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-background pt-24 px-4 flex items-center justify-center">
                <div className="bg-card rounded-xl p-8 max-w-lg w-full text-center border border-border shadow-lg">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Booking Confirmed!</h2>
                    <p className="text-muted-foreground mb-6">
                        Please complete your payment by scanning the QR code below
                    </p>

                    {/* QR Payment Image */}
                    <div className="bg-white p-4 rounded-xl mb-6 border-2 border-primary/20">
                        <img
                            src="/lao-qr-payment.jpg"
                            alt="LAO QR Payment"
                            className="w-full max-w-sm mx-auto rounded-lg"
                        />
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">
                        After payment, you will be redirected to your profile...
                    </p>

                    <button
                        onClick={() => navigate('/profile')}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Go to My Bookings
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Search
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Schedule Info & Passengers */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Schedule Info Card */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                                <Bus className="w-5 h-5 text-primary" />
                                Trip Details
                            </h2>

                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl font-bold text-foreground">{schedule.route.from}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{schedule.departureTime}</p>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full mb-1">
                                        {schedule.duration}
                                    </span>
                                    <div className="w-full h-px bg-border relative w-24">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full"></div>
                                    </div>
                                </div>

                                <div className="flex-1 text-right md:text-left">
                                    <div className="flex items-center gap-2 mb-1 justify-end md:justify-start">
                                        <span className="text-2xl font-bold text-foreground">{schedule.route.to}</span>
                                    </div>
                                    <p className="text-muted-foreground text-sm">{schedule.arrivalTime}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm border-t border-border pt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="text-foreground">
                                        {new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Bus className="w-4 h-4 text-primary" />
                                    <span className="text-foreground">{schedule.busId.name} ({schedule.busId.company})</span>
                                </div>
                            </div>
                        </div>

                        {/* Passenger Details Card */}
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                                    <User className="w-5 h-5 text-primary" />
                                    Passenger Details
                                </h2>

                                <div className="flex items-center gap-3 bg-muted rounded-lg p-1">
                                    <button
                                        onClick={() => handlePassengerChange(passengers - 1)}
                                        disabled={passengers <= 1}
                                        className="p-1.5 rounded-md hover:bg-background disabled:opacity-50 transition-colors"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-bold w-4 text-center">{passengers}</span>
                                    <button
                                        onClick={() => handlePassengerChange(passengers + 1)}
                                        disabled={passengers >= schedule.availableSeats}
                                        className="p-1.5 rounded-md hover:bg-background disabled:opacity-50 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {passengerDetails.map((passenger, index) => (
                                    <div key={index} className="p-4 border border-border rounded-lg bg-muted/30">
                                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground">Passenger {index + 1}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5">Full Name *</label>
                                                <input
                                                    type="text"
                                                    value={passenger.name}
                                                    onChange={(e) => updatePassengerDetail(index, "name", e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    placeholder="Enter full name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium mb-1.5">Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    value={passenger.phone}
                                                    onChange={(e) => updatePassengerDetail(index, "phone", e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    placeholder="Enter phone number"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-xs font-medium mb-1.5">Email (Optional)</label>
                                                <input
                                                    type="email"
                                                    value={passenger.email}
                                                    onChange={(e) => updatePassengerDetail(index, "email", e.target.value)}
                                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                                                    placeholder="Enter email address"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="space-y-6">
                        <div className="bg-card rounded-xl border border-border p-6 shadow-sm sticky top-24">
                            <h2 className="text-xl font-bold text-foreground mb-4">Payment Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Price per seat</span>
                                    <span className="font-medium">{schedule.price} LAK</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Passengers</span>
                                    <span className="font-medium">x {passengers}</span>
                                </div>
                                <div className="border-t border-border pt-3 flex justify-between items-center">
                                    <span className="font-bold text-lg">Total</span>
                                    <span className="font-bold text-xl text-primary">{schedule.price * passengers} LAK</span>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-500 text-sm p-3 rounded-lg mb-4">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-gradient-to-r from-primary via-blue-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl hover:shadow-primary/50 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Pay {schedule.price * passengers} LAK
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-muted-foreground mt-4 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                Secure Payment via PhaPay Gateway
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
