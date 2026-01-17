import { useNavigate } from "react-router-dom"
import { Bus, Car, Bike, ArrowRight } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import ScheduleSection from "@/components/schedule-section"
import AboutSection from "@/components/about-section"

const vehicleTypes = [
    {
        id: "bus",
        name: "Bus",
        icon: Bus,
        description: "Comfortable long-distance travel",
        features: ["Air Conditioning", "WiFi", "Reclining Seats", "Restroom"],
        priceRange: "50,000 - 200,000 LAK",
        image: "/bus-bg.png"
    },
    {
        id: "van",
        name: "Van",
        icon: Car,
        description: "Flexible group transport",
        features: ["Private Ride", "Door-to-Door", "Luggage Space", "Flexible Schedule"],
        priceRange: "100,000 - 300,000 LAK",
        image: "/van-bg.png"
    },
    {
        id: "tuktuk",
        name: "TukTuk",
        icon: Bike,
        description: "Quick city rides",
        features: ["Fast Service", "City Tours", "Affordable", "Local Experience"],
        priceRange: "20,000 - 80,000 LAK",
        image: "/tuktuk-bg.png"
    },
]

export default function SelectVehiclePage() {
    const navigate = useNavigate()

    const handleSelectVehicle = (vehicleId: string) => {
        navigate(`/search?vehicle=${vehicleId}`)
    }

    return (
        <main className="min-h-screen bg-background">
            <Navbar />

            <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-16">
                        <span className="inline-block text-sm font-semibold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
                            Step 1 of 5
                        </span>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary mb-6">
                            Book Your Bus Tickets<br /> with Ease
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Find the best buses, compare prices, and book your Tickets in minutes with BusGoGo.
                        </p>
                    </div>

                    {/* Vehicle Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {vehicleTypes.map((vehicle) => {
                            const Icon = vehicle.icon
                            return (
                                <button
                                    key={vehicle.id}
                                    onClick={() => handleSelectVehicle(vehicle.id)}
                                    className="group relative bg-card rounded-2xl border-2 border-border p-8 text-left transition-all duration-300 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 hover:scale-105 overflow-hidden h-[450px] flex flex-col justify-end"
                                >
                                    {/* Background Image */}
                                    <div
                                        className="absolute inset-0 z-0 transition-transform duration-500 group-hover:scale-110"
                                        style={{
                                            backgroundImage: `url(${vehicle.image})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 z-10" />

                                    {/* Content (z-20 to sit above overlay) */}
                                    <div className="relative z-20">
                                        {/* Icon */}
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/20 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                                            <Icon className="w-8 h-8 text-white group-hover:text-white transition-colors" />
                                        </div>

                                        {/* Title & Description */}
                                        <h3 className="text-3xl font-bold text-white mb-2">
                                            {vehicle.name}
                                        </h3>
                                        <p className="text-white/80 mb-6 font-medium">
                                            {vehicle.description}
                                        </p>

                                        {/* Features */}
                                        <ul className="space-y-2 mb-6">
                                            {vehicle.features.map((feature, index) => (
                                                <li key={index} className="flex items-center gap-2 text-sm text-white/70">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Price Range & CTA */}
                                        <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                                            <div>
                                                <p className="text-xs text-white/60 uppercase tracking-wider font-semibold">Starts from</p>
                                                <p className="text-lg font-bold text-white">{vehicle.priceRange.split(' - ')[0]}</p>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center group-hover:bg-primary transition-colors">
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </section>


            <ScheduleSection />
            <AboutSection />

            <Footer />
        </main>
    )
}
