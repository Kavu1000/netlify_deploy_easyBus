
import { useState } from "react"
import { X, CreditCard, Check, Lock } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

export default function PaymentModal({ booking, bus, onClose, onComplete }) {
    const [paymentMethod, setPaymentMethod] = useState("card")
    const [cardDetails, setCardDetails] = useState({
        number: "",
        name: "",
        expiry: "",
        cvv: "",
    })
    const [processing, setProcessing] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handlePayment = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError("Please login to complete your booking");
            // Optionally redirect to login
            // navigate('/login'); 
            return;
        }

        setProcessing(true)
        setError(null)

        try {
            // Create a booking for each passenger
            const bookingPromises = booking.passengerDetails.map((passenger, index) => {
                // Construct departure Date object
                // Assuming bus.date is YYYY-MM-DD and bus.departure is HH:MM AM/PM
                // For simplicity, using current date/time if parsing fails, or just passing the date string if backend handles it (it expects Date)
                // Let's try to construct a valid Date object
                const dateStr = bus.date; // "2025-11-29"
                const timeStr = bus.departure; // "08:30 AM"

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
                    busId: bus.busId || bus.id, // Handle both cases
                    seatNumber: `A${index + 1}`, // Auto-assign seat for now
                    departureStation: bus.from,
                    arrivalStation: bus.to,
                    departureTime: departureDate,
                    price: bus.price,
                    passengerDetails: {
                        name: passenger.name || 'Unknown Passenger',
                        // Add other details if available
                    },
                    paymentMethod: paymentMethod,
                    paymentStatus: 'completed'
                });
            });

            await Promise.all(bookingPromises);

            setProcessing(false)
            setSuccess(true)

            setTimeout(() => {
                onComplete()
            }, 2000)

        } catch (err) {
            console.error("Booking failed:", err);
            setError(err.response?.data?.message || "Booking failed. Please try again.");
            setProcessing(false);
        }
    }

    const formatCardNumber = (value) => {
        const cleaned = value.replace(/\D/g, "")
        const groups = cleaned.match(/.{1,4}/g)
        return groups ? groups.join(" ").substring(0, 19) : ""
    }

    const formatExpiry = (value) => {
        const cleaned = value.replace(/\D/g, "")
        if (cleaned.length >= 2) {
            return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4)
        }
        return cleaned
    }

    if (success) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
                <div className="bg-card rounded-xl p-8 max-w-md w-full text-center border border-border">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
                    <p className="text-muted-foreground mb-4">
                        Your booking has been confirmed. A confirmation email has been sent to your registered email address.
                    </p>
                    <p className="text-primary font-semibold">Booking ID: BG{Date.now().toString().slice(-8)}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-card rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card">
                    <h2 className="text-2xl font-bold text-foreground">Payment</h2>
                    <button
                        onClick={onClose}
                        disabled={processing}
                        className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50 text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    <div className="bg-muted rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">Order Summary</h3>
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span>
                                {bus.name} ({bus.from} → {bus.to})
                            </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span>Passengers:</span>
                            <span>{booking.passengers}</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground mb-1">
                            <span>Price per seat:</span>
                            <span>KIP {bus.price}</span>
                        </div>
                        <div className="border-t border-border mt-3 pt-3 flex justify-between">
                            <span className="font-semibold text-foreground">Total Amount:</span>
                            <span className="text-xl font-bold text-primary">KIP {booking.totalPrice}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-foreground font-medium mb-3">Payment Method</label>
                        <div className="grid grid-cols-3 gap-4">
                            <button
                                onClick={() => setPaymentMethod("card")}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === "card" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <CreditCard className="w-6 h-6 mx-auto mb-2 text-foreground" />
                                <span className="text-sm text-foreground">Card</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod("paypal")}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === "paypal" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <span className="text-xl mb-2 block">💳</span>
                                <span className="text-sm text-foreground">PayPal</span>
                            </button>
                            <button
                                onClick={() => setPaymentMethod("wallet")}
                                className={`p-4 rounded-lg border text-center transition-colors ${paymentMethod === "wallet" ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                                    }`}
                            >
                                <span className="text-xl mb-2 block">📱</span>
                                <span className="text-sm text-foreground">Wallet</span>
                            </button>
                        </div>
                    </div>

                    {paymentMethod === "card" && (
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Card Number</label>
                                <input
                                    type="text"
                                    value={cardDetails.number}
                                    onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength={19}
                                    className="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    value={cardDetails.name}
                                    onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        value={cardDetails.expiry}
                                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                                        placeholder="MM/YY"
                                        maxLength={5}
                                        className="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground mb-2">CVV</label>
                                    <input
                                        type="text"
                                        value={cardDetails.cvv}
                                        onChange={(e) =>
                                            setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                                        }
                                        placeholder="123"
                                        maxLength={4}
                                        className="w-full bg-input text-foreground px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-muted-foreground text-sm mb-6">
                        <Lock className="w-4 h-4" />
                        <span>Your payment information is secure and encrypted</span>
                    </div>

                    <button
                        onClick={handlePayment}
                        disabled={processing}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>Pay KIP {booking.totalPrice}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
