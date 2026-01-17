import { Bus, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
    return (
        <footer className="bg-card border-t border-border py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Bus className="w-8 h-8 text-primary" />
                            <span className="text-xl font-bold text-foreground">BusGoGo</span>
                        </div>
                        <p className="text-muted-foreground mb-4">
                            Our mission is to provide the most reliable, safe, and sustainable public transportation service in the region. We are committed to connecting communities, fostering economic accessibility, and reducing our collective carbon footprint, one journey at a time.
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                                    <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
                                </svg>
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="w-5 h-5"
                                >
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#home" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </a>
                            </li>
                            <li>
                                <a href="#buses" className="text-muted-foreground hover:text-primary transition-colors">
                                    Search Buses
                                </a>
                            </li>
                            <li>
                                <a href="#schedule" className="text-muted-foreground hover:text-primary transition-colors">
                                    Schedule
                                </a>
                            </li>
                            <li>
                                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About Us
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Popular Routes</h3>
                        <ul className="space-y-2 text-muted-foreground">
                            <li>Vientiane → Bolikhamxai</li>
                            <li>Vientiane → Savannakhet</li>
                            <li>Vientiane → Paksun</li>
                            <li>Vientiane → Paksun(2)</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4 text-primary" />
                                +856 20   7862 2220
                            </li>
                            <li className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4 text-primary" />
                                busgo@gmail.com
                            </li>
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="w-4 h-4 text-primary mt-1" />
                                Vientiane, Laos
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} BusGoGo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
