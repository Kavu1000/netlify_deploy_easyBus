import { useState } from "react"
import { Bus, Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function SignUpPage() {
    const navigate = useNavigate()
    const { signup } = useAuth()
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [agreeTerms, setAgreeTerms] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        setError("")

        // Validation
        if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
            setError("Please fill in all fields")
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters and include a number & special character")
            return
        }

        if (!agreeTerms) {
            setError("Please agree to Terms of Service")
            return
        }

        setIsLoading(true)

        try {
            const result = await signup(formData.fullName, formData.email, formData.password, formData.phone);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error("Signup failed:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4 py-8">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-2xl">
                            <Bus className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent mb-2">
                        Join BusGo
                    </h1>
                    <p className="text-muted-foreground">Create your account and start booking</p>
                </div>

                {/* Sign Up Card */}
                <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border border-primary/10 shadow-2xl shadow-primary/10 backdrop-blur">
                    <form onSubmit={handleSignUp} className="space-y-5">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Full Name Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter Your Full Name"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-4 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter Your Email Address"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-4 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                            </div>
                        </div>

                        {/* Phone Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter Your Phone Number"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-4 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-12 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-12 py-3 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="w-5 h-5 rounded-lg bg-input border border-primary/20 cursor-pointer accent-primary mt-0.5"
                            />
                            <span className="text-muted-foreground text-sm group-hover:text-foreground transition-colors">
                                I agree to the{" "}
                                <button type="button" className="text-primary hover:text-blue-400 font-medium">
                                    Terms of Service
                                </button>{" "}
                                and{" "}
                                <button type="button" className="text-primary hover:text-blue-400 font-medium">
                                    Privacy Policy
                                </button>
                            </span>
                        </label>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-8 text-center border-t border-primary/10 pt-8">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <button
                                onClick={() => navigate("/login")}
                                className="text-primary hover:text-blue-400 font-bold transition-colors"
                            >
                                Login
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-sm mt-8">
                    We'll never share your information. Read our Privacy Policy.
                </p>
            </div>
        </div>
    )
}
