import { Shield, Clock, CreditCard, Headphones, Bus, MapPin } from "lucide-react"

const features = [
    {
        icon: Shield,
        title: "Safe & Secure",
        description: "All our buses are regularly inspected and maintained to ensure your safety throughout the journey.",
    },
    {
        icon: Clock,
        title: "On-Time Service",
        description: "We pride ourselves on punctuality. Our buses depart and arrive on schedule, respecting your time.",
    },
    {
        icon: CreditCard,
        title: "Easy Payment",
        description:
            "Multiple payment options including credit cards, debit cards, and digital wallets for your convenience.",
    },
    {
        icon: Headphones,
        title: "24/7 Support",
        description: "Our customer support team is available around the clock to assist you with any queries or concerns.",
    },
]

const stats = [
    { value: "500+", label: "Daily Trips" },
    { value: "50+", label: "Cities Covered" },
    { value: "1M+", label: "Happy Customers" },
    { value: "99%", label: "On-Time Rate" },
]

export default function AboutSection() {
    return (
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-muted/30 to-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-4">About BusGoGo</h2>
                    <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
                        We're on a mission to make bus travel comfortable, affordable, and accessible for everyone. With years of
                        experience in the transportation industry, we've built a service you can trust.
                    </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 text-center border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
                            <p className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent mb-2">{stat.value}</p>
                            <p className="text-muted-foreground font-semibold">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border border-primary/10 hover:border-primary/40 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-blue-400/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 border border-primary/20">
                                <feature.icon className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-r from-primary/10 via-blue-400/10 to-primary/10 rounded-2xl p-8 sm:p-12 border border-primary/20 backdrop-blur">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
                        <div>
                            <ul className="space-y-6">
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                                        <Bus className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-bold text-lg">Modern Fleet</p>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            Brand new buses with comfortable seating and modern amenities
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-bold text-lg">Extensive Network</p>
                                        <p className="text-muted-foreground text-sm mt-1">Covering major cities and towns across the country</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4 group">
                                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center group-hover:bg-primary/30 transition-colors flex-shrink-0">
                                        <CreditCard className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-foreground font-bold text-lg">Best Prices</p>
                                        <p className="text-muted-foreground text-sm mt-1">Competitive pricing with no hidden fees or charges</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="relative h-64 lg:h-96 rounded-2xl overflow-hidden shadow-2xl shadow-primary/20 border border-primary/20">
                            <img
                                src="/modern-bus-interior-with-comfortable-seats.jpg"
                                alt="Modern bus interior"
                                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
