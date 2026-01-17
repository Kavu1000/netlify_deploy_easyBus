
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Bus, Menu, X, User, LogOut, UserCircle } from "lucide-react"
import { useAuth } from "../contexts/AuthContext"

export default function Navbar() {
    const navigate = useNavigate()
    const { user, logout, isAuthenticated } = useAuth()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)

    const scrollToSection = (id) => {
        const element = document.getElementById(id)
        if (element) {
            element.scrollIntoView({ behavior: "smooth" })
        }
        setMobileMenuOpen(false)
    }

    const handleLoginClick = () => {
        navigate("/login")
        setMobileMenuOpen(false)
    }

    const handleSignUpClick = () => {
        navigate("/signup")
        setMobileMenuOpen(false)
    }

    const handleProfileClick = () => {
        navigate("/profile")
        setProfileDropdownOpen(false)
        setMobileMenuOpen(false)
    }

    const handleLogout = () => {
        logout()
        setProfileDropdownOpen(false)
        setMobileMenuOpen(false)
        navigate("/")
    }

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-background via-background to-background/80 backdrop-blur-xl border-b border-primary/10 shadow-lg shadow-primary/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate("/")}>
                        <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-300">
                            <Bus className="w-7 h-7 text-primary group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">BusGoGo</span>
                            <span className="text-xs text-primary/60 font-medium">Travel Easily</span>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-1">
                        <button
                            onClick={() => scrollToSection("home")}
                            className="px-4 py-2 text-foreground hover:bg-primary/10 rounded-lg transition-all duration-300 font-medium hover:text-primary"
                        >
                            Home
                        </button>
                        <button
                            onClick={() => scrollToSection("schedule")}
                            className="px-4 py-2 text-muted-foreground hover:bg-primary/10 rounded-lg transition-all duration-300 font-medium hover:text-primary"
                        >
                            Schedule
                        </button>
                        <button
                            onClick={() => scrollToSection("about")}
                            className="px-4 py-2 text-muted-foreground hover:bg-primary/10 rounded-lg transition-all duration-300 font-medium hover:text-primary"
                        >
                            About
                        </button>
                    </div>

                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-medium"
                                >
                                    <UserCircle className="w-5 h-5" />
                                    {user?.username || 'Profile'}
                                </button>

                                {profileDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-card border-2 border-primary/20 rounded-xl shadow-xl overflow-hidden z-50">
                                        <button
                                            onClick={handleProfileClick}
                                            className="w-full text-left px-4 py-3 hover:bg-primary/10 transition-colors flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4" />
                                            My Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 hover:bg-red-500/10 text-red-500 transition-colors flex items-center gap-2 border-t border-primary/10"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={handleLoginClick}
                                    className="px-5 py-2.5 text-foreground hover:bg-primary/10 rounded-lg transition-all duration-300 font-medium border border-primary/20 hover:border-primary/40"
                                >
                                    Login
                                </button>
                                <button
                                    onClick={handleSignUpClick}
                                    className="px-5 py-2.5 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 font-medium hover:scale-105"
                                >
                                    Sign up
                                </button>
                            </>
                        )}
                    </div>

                    <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-border">
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => scrollToSection("home")}
                                className="text-foreground hover:text-primary transition-colors text-left"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => scrollToSection("schedule")}
                                className="text-muted-foreground hover:text-primary transition-colors text-left"
                            >
                                Schedule
                            </button>
                            <button
                                onClick={() => scrollToSection("about")}
                                className="text-muted-foreground hover:text-primary transition-colors text-left"
                            >
                                About
                            </button>
                            <div className="flex flex-col gap-4 pt-4 border-t border-border">
                                {isAuthenticated ? (
                                    <>
                                        <button
                                            onClick={handleProfileClick}
                                            className="text-foreground hover:text-primary transition-colors text-left flex items-center gap-2"
                                        >
                                            <User className="w-4 h-4" />
                                            My Profile
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="text-red-500 hover:text-red-400 transition-colors text-left flex items-center gap-2"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleLoginClick}
                                            className="text-foreground hover:text-primary transition-colors"
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={handleSignUpClick}
                                            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

