
import { useState, useEffect } from "react"
import { Clock, MapPin, Filter, ChevronDown } from "lucide-react"
import api from "../services/api"

interface Departure {
    time: string;
    date: string;
    busName: string;
    company: string;
    duration: string;
    price: number;
    scheduleId: string;
    availableSeats: number;
}

interface RouteSchedule {
    id: string;
    from: string;
    to: string;
    departures: Departure[];
}

export default function ScheduleSection() {
    const [schedules, setSchedules] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fromCity, setFromCity] = useState("All Cities")
    const [toCity, setToCity] = useState("All Cities")
    const [selectedDate, setSelectedDate] = useState("All Dates")
    const [selectedTime, setSelectedTime] = useState("All Times")

    // Extract unique cities and dates from schedules
    const cities = ["All Cities", ...new Set(schedules.flatMap(s => [s.route?.from, s.route?.to]).filter(Boolean))]
    const dates = ["All Dates", ...new Set(schedules.map(s => {
        if (s.date) {
            const date = new Date(s.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return null;
    }).filter(Boolean))]
    const times = ["All Times", "Morning (6AM-12PM)", "Afternoon (12PM-6PM)", "Evening (6PM-12AM)", "Night (12AM-6AM)"]

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await api.get('/schedules');
            setSchedules(response.data.data || []);
        } catch (err) {
            console.error("Failed to fetch schedules:", err);
            setError("Failed to load schedules. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setFromCity("All Cities")
        setToCity("All Cities")
        setSelectedDate("All Dates")
        setSelectedTime("All Times")
    }

    const getTimeSlot = (time: string) => {
        const hour = Number.parseInt(time.split(":")[0])
        const isPM = time.includes("PM")
        const hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour

        if (hour24 >= 6 && hour24 < 12) return "Morning (6AM-12PM)"
        if (hour24 >= 12 && hour24 < 18) return "Afternoon (12PM-6PM)"
        if (hour24 >= 18 && hour24 < 24) return "Evening (6PM-12AM)"
        return "Night (12AM-6AM)"
    }

    const getFormattedDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    // Group schedules by route
    const groupedSchedules: Record<string, RouteSchedule> = schedules.reduce((acc, schedule) => {
        const routeKey = `${schedule.route?.from}-${schedule.route?.to}`;
        if (!acc[routeKey]) {
            acc[routeKey] = {
                id: routeKey,
                from: schedule.route?.from,
                to: schedule.route?.to,
                departures: []
            };
        }
        acc[routeKey].departures.push({
            time: schedule.departureTime,
            date: getFormattedDate(schedule.date),
            busName: schedule.busId?.name || 'Unknown Bus',
            company: schedule.busId?.company || 'Unknown Company',
            duration: schedule.duration,
            price: schedule.price,
            scheduleId: schedule._id,
            availableSeats: schedule.availableSeats
        });
        return acc;
    }, {} as Record<string, RouteSchedule>);

    const scheduleData: RouteSchedule[] = Object.values(groupedSchedules);

    const filteredSchedules = scheduleData
        .filter((route) => {
            if (fromCity !== "All Cities" && route.from !== fromCity) return false
            if (toCity !== "All Cities" && route.to !== toCity) return false
            return true
        })
        .map((route) => ({
            ...route,
            departures: route.departures.filter((dep) => {
                if (selectedDate !== "All Dates" && dep.date !== selectedDate) return false
                if (selectedTime !== "All Times" && getTimeSlot(dep.time) !== selectedTime) return false
                return true
            }),
        }))
        .filter((route) => route.departures.length > 0)

    const SelectDropdown = ({ label, value, onChange, options }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm text-muted-foreground">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="appearance-none w-full bg-muted border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                >
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
        </div>
    )

    if (loading) {
        return (
            <section id="schedule" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading schedules...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section id="schedule" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
                <div className="max-w-7xl mx-auto text-center">
                    <p className="text-red-500">{error}</p>
                    <button onClick={fetchSchedules} className="mt-4 text-primary hover:underline">Try Again</button>
                </div>
            </section>
        );
    }

    return (
        <section id="schedule" className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold text-foreground mb-2">Bus Schedule</h2>
                    <p className="text-muted-foreground">View complete bus schedules for all routes</p>
                </div>

                <div className="bg-card rounded-xl border border-border p-6 mb-8">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-5 h-5 text-foreground" />
                        <h3 className="text-lg font-semibold text-foreground">Filter Schedules</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-6">
                        Select your departure location, destination, date, and time
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <SelectDropdown label="From" value={fromCity} onChange={setFromCity} options={cities} />
                        <SelectDropdown label="To" value={toCity} onChange={setToCity} options={cities} />
                        <SelectDropdown label="Date" value={selectedDate} onChange={setSelectedDate} options={dates} />
                        <SelectDropdown label="Time" value={selectedTime} onChange={setSelectedTime} options={times} />
                        <button
                            onClick={resetFilters}
                            className="px-6 py-2.5 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {filteredSchedules.length === 0 ? (
                        <div className="bg-card rounded-xl border border-border p-12 text-center">
                            <p className="text-muted-foreground">No schedules found matching your filters.</p>
                        </div>
                    ) : (
                        filteredSchedules.map((route) => (
                            <div key={route.id} className="bg-card rounded-xl border border-border overflow-hidden">
                                <div className="p-6 border-b border-border">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        <h3 className="text-lg font-semibold text-foreground">
                                            {route.from} - {route.to}
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm mt-1">Scheduled departures for this route</p>
                                </div>

                                <div className="divide-y divide-border">
                                    {route.departures.map((departure, index) => (
                                        <div
                                            key={index}
                                            className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-5 h-5 text-primary" />
                                                    <div>
                                                        <p className="font-semibold text-foreground text-lg">{departure.time}</p>
                                                        <p className="text-muted-foreground text-sm">{departure.date}</p>
                                                    </div>
                                                </div>
                                                <div className="border-l border-border pl-6">
                                                    <p className="font-medium text-foreground">{departure.busName}</p>
                                                    <p className="text-muted-foreground text-sm">{departure.company}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <span className="px-3 py-1 bg-muted rounded-lg text-muted-foreground text-sm">
                                                    {departure.duration}
                                                </span>
                                                <span className="text-foreground font-bold text-lg">{departure.price} LAK</span>
                                                <button
                                                    onClick={() => window.location.href = `/booking/${departure.scheduleId}`}
                                                    className="px-5 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
                                                >
                                                    Book
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    )
}
