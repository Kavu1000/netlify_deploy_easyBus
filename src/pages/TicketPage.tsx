import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { Check, Download, Printer, Home, MapPin, Calendar, Clock, User, QrCode } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function TicketPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const from = searchParams.get("from") || ""
    const to = searchParams.get("to") || ""
    const date = searchParams.get("date") || ""
    const passengerName = searchParams.get("name") || "Guest"
    const seats = searchParams.get("seats") || "Unassigned"
    const priceParam = searchParams.get("price")

    // Mock ticket data
    const ticket = {
        ticketNumber: `TKT-${Date.now().toString().slice(-8)}`,
        vehicleName: "Express Bus A",
        company: "Laos Express",
        departure: "08:00 AM",
        arrival: "12:30 PM",
        duration: "4h 30m",
        seatNumber: seats.replace(/,/g, ", "), // Add space after commas
        price: priceParam ? parseInt(priceParam) : 150000,
        bookingDate: new Date().toLocaleDateString(),
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    {/* Success Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Check className="w-10 h-10 text-green-500" />
                        </div>
                        <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                            Step 5 of 5 - Complete!
                        </span>
                        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                            Booking Confirmed!
                        </h1>
                        <p className="text-muted-foreground">
                            Your ticket has been sent to your email
                        </p>
                    </div>

                    {/* Ticket Card */}
                    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl" id="ticket">
                        {/* Ticket Header */}
                        <div className="bg-primary/10 p-6 border-b border-border">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-primary">BusGoGo Ticket</h2>
                                    <p className="text-sm text-muted-foreground">{ticket.ticketNumber}</p>
                                </div>
                                <div className="w-16 h-16 bg-white rounded-lg p-2 flex items-center justify-center">
                                    <QrCode className="w-12 h-12 text-foreground" />
                                </div>
                            </div>
                        </div>

                        {/* Route Info */}
                        <div className="p-6 border-b border-border">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">{from}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.departure}</p>
                                </div>
                                <div className="flex-1 px-4">
                                    <div className="border-t-2 border-dashed border-muted relative">
                                        <div className="absolute left-1/2 -translate-x-1/2 -top-3 bg-card px-2">
                                            <Clock className="w-5 h-5 text-primary" />
                                        </div>
                                    </div>
                                    <p className="text-center text-sm text-muted-foreground mt-2">{ticket.duration}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-foreground">{to}</p>
                                    <p className="text-sm text-muted-foreground">{ticket.arrival}</p>
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="p-6 grid grid-cols-2 gap-4 border-b border-border">
                            <div>
                                <p className="text-sm text-muted-foreground">Passenger</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <User className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">{passengerName}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Seat Number</p>
                                <p className="font-bold text-lg text-primary mt-1">{ticket.seatNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Travel Date</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Calendar className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle</p>
                                <p className="font-medium text-foreground mt-1">{ticket.vehicleName}</p>
                                <p className="text-sm text-muted-foreground">{ticket.company}</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="p-6 bg-primary/5">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-foreground">Total Paid</span>
                                <span className="text-2xl font-bold text-primary">{ticket.price.toLocaleString()} LAK</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                        <button
                            onClick={() => window.print()}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                        >
                            <Printer className="w-5 h-5" />
                            Print Ticket
                        </button>
                        <button
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-card border border-border rounded-xl font-medium hover:bg-muted transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Download PDF
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            <Home className="w-5 h-5" />
                            Back to Home
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    )
}
