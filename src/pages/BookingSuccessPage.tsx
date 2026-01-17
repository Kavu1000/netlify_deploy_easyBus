import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Download, Home, Printer, Bus, Calendar, Clock, MapPin, User } from 'lucide-react';
import api from '../services/api';

const BookingSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderNo = searchParams.get('orderNo');

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderNo) {
            setError("No order number provided");
            setLoading(false);
            return;
        }

        const confirmAndFetch = async () => {
            try {
                // First confirm payment status
                await api.post('/payment/confirm-success', { orderNo });

                // Then fetch booking details
                const response = await api.get(`/bookings/order/${orderNo}`);
                setBookings(response.data.data);
            } catch (err) {
                console.error("Failed to process booking success:", err);
                setError("Failed to load booking details");
            } finally {
                setLoading(false);
            }
        };

        confirmAndFetch();
    }, [orderNo]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen pt-24 px-4 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
                    <p className="text-muted-foreground mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-primary text-primary-foreground px-6 py-2 rounded-lg"
                    >
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = bookings.reduce((sum, booking) => sum + booking.price, 0);
    const firstBooking = bookings[0];

    return (
        <div className="min-h-screen bg-muted/30 pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="w-10 h-10 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Payment Successful!</h1>
                    <p className="text-muted-foreground">
                        Your booking has been confirmed. Thank you for choosing BusGoGo.
                    </p>
                </div>

                {/* Bill/Ticket Card */}
                <div className="bg-card rounded-xl border border-border shadow-lg overflow-hidden mb-8" id="ticket-bill">
                    {/* Bill Header */}
                    <div className="bg-primary/5 p-6 border-b border-border flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-1">BusGoGo Ticket</h2>
                            <p className="text-sm text-muted-foreground">Order #{orderNo}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="font-medium">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Journey Details */}
                    <div className="p-6 border-b border-border">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Bus className="w-5 h-5 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Bus Operator</p>
                                    <p className="font-medium">{firstBooking?.busId?.company}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">Bus Number</p>
                                <p className="font-medium">{firstBooking?.busId?.licensePlate}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">From</p>
                                        <p className="font-medium text-lg">{firstBooking?.departureStation}</p>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(firstBooking?.departureTime).toLocaleDateString()}
                                            <Clock className="w-4 h-4 ml-2" />
                                            {new Date(firstBooking?.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">To</p>
                                        <p className="font-medium text-lg">{firstBooking?.arrivalStation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Passengers & Seats */}
                    <div className="p-6 border-b border-border bg-muted/10">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <User className="w-4 h-4" /> Passenger Details
                        </h3>
                        <div className="space-y-3">
                            {bookings.map((booking, index) => (
                                <div key={booking._id} className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium">{booking.passengerDetails?.name || booking.userId.username}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="bg-background border border-border px-2 py-1 rounded text-xs">
                                            Seat {booking.seatNumber}
                                        </span>
                                        <span className="font-medium">{booking.price.toLocaleString()} LAK</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Total */}
                    <div className="p-6 bg-primary/5 flex justify-between items-center">
                        <span className="font-bold text-lg">Total Amount Paid</span>
                        <span className="font-bold text-2xl text-primary">{totalAmount.toLocaleString()} LAK</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-background border border-border rounded-xl hover:bg-muted transition-colors font-medium"
                    >
                        <Printer className="w-4 h-4" />
                        Print Ticket
                    </button>
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                    >
                        <Home className="w-4 h-4" />
                        Go to My Bookings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingSuccessPage;
