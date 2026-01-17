
import { useState } from "react"
import { X, MapPin, Clock, User, Minus, Plus } from "lucide-react"

export default function BookingModal({ bus, onClose, onConfirm }) {
    const [passengers, setPassengers] = useState(1)
    const [passengerDetails, setPassengerDetails] = useState([{ name: "", email: "", phone: "" }])

    const handlePassengerChange = (count) => {
        if (count < 1 || count > bus.seats) return
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

    const handleConfirm = () => {
        onConfirm({
            bus,
            passengers,
            passengerDetails,
            totalPrice: bus.price * passengers,
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
                <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-card">
                    <h2 className="text-2xl font-bold text-foreground">Book Your Ticket</h2>
                    <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    <div className="bg-muted rounded-lg p-4 mb-6">
                        <h3 className="text-lg font-semibold text-foreground mb-2">{bus.name}</h3>
                        <p className="text-muted-foreground text-sm mb-4">{bus.company}</p>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-foreground">{bus.from}</span>
                            </div>
                            <div className="flex-1 border-t border-dashed border-border" />
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                <span className="text-foreground">{bus.to}</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                            <span>Departure: {bus.departure}</span>
                            <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {bus.duration}
                            </div>
                            <span>Arrival: {bus.arrival}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-foreground font-medium mb-3"></label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePassengerChange(passengers - 1)}
                                disabled={passengers <= 1}
                                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                            >
                                <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-2xl font-bold text-foreground w-12 text-center">{passengers}</span>
                            <button
                                onClick={() => handlePassengerChange(passengers + 1)}
                                disabled={passengers >= bus.seats}
                                className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <span className="text-muted-foreground">({bus.seats} seats available)</span>
                        </div>
                    </div>

                    <div className="bg-primary/10 rounded-lg p-4 mb-6">
                        <div className="flex justify-between items-center">
                            <span className="text-foreground">Price per seat:</span>
                            <span className="text-foreground">{bus.price} LAK</span>
                        </div>
                        <div className="border-t border-border mt-3 pt-3 flex justify-between items-center">
                            <span className="text-lg font-semibold text-foreground">Total:</span>
                            <span className="text-2xl font-bold text-primary">{bus.price * passengers} LAK</span>
                        </div>
                    </div>

                    <button
                        onClick={handleConfirm}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>
        </div>
    )
}
