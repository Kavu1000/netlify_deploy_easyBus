import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Phone, LogOut, Calendar, Bus, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function ProfilePage() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchBookings();
    }, [isAuthenticated, navigate]);

    const fetchBookings = async () => {
        try {
            const response = await api.get('/bookings/my-bookings');
            setBookings(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/40">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 text-white py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Home
                    </button>
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <User className="w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold mb-2">{user.username || 'User'}</h1>
                            <p className="text-white/80 text-lg">Welcome back!</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* User Info Card */}
                <div className="bg-card rounded-2xl border-2 border-primary/20 p-8 mb-8 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <User className="w-6 h-6 text-primary" />
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-xl">
                            <Mail className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Email</p>
                                <p className="font-semibold">{user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/10 to-blue-400/10 rounded-xl">
                            <Phone className="w-5 h-5 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-semibold">{user.phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="mt-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 font-medium"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>

                {/* Bookings Section */}
                <div className="bg-card rounded-2xl border-2 border-primary/20 p-8 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Bus className="w-6 h-6 text-primary" />
                        My Bookings
                    </h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading bookings...</p>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Bus className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                            <p className="text-muted-foreground text-lg">No bookings yet</p>
                            <button
                                onClick={() => navigate('/')}
                                className="mt-4 px-6 py-3 bg-gradient-to-r from-primary to-blue-500 text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-medium"
                            >
                                Book Your First Trip
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <div
                                    key={booking._id}
                                    className="p-6 bg-gradient-to-br from-primary/5 to-blue-400/5 rounded-xl border border-primary/20 hover:border-primary/40 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-lg">{booking.busId?.name || 'Bus'}</h3>
                                            <p className="text-sm text-muted-foreground">{booking.busId?.company}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${booking.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                                                booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {booking.status}
                                            </span>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Booked on: {new Date(booking.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">From</p>
                                            <p className="font-semibold">{booking.departureStation}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">To</p>
                                            <p className="font-semibold">{booking.arrivalStation}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Travel Date</p>
                                            <p className="font-semibold flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(booking.departureTime).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Seats</p>
                                            <p className="font-semibold">{booking.seatNumber} ({booking.passengerDetails?.name || 'Passenger'})</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Total Price</p>
                                            <p className="font-semibold text-primary">{booking.price} LAK</p>
                                        </div>
                                    </div>


                                </div>
                            ))}
                            {/* Back to Home Button */}
                            <div className="mt-8 text-center">
                                <button
                                    onClick={() => navigate('/')}
                                    className="px-6 py-3 bg-secondary text-secondary-foreground rounded-xl hover:bg-secondary/80 transition-all duration-300 font-medium flex items-center gap-2 mx-auto"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
