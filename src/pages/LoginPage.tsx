import { useState } from "react"
import { Bus, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function LoginPage() {
    const navigate = useNavigate()
    const { login } = useAuth()
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")

    const handleLogin = async (e) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            const result = await login(email, password);

            if (result.success) {
                navigate('/');
            } else {
                setError(result.error);
            }
        } catch (err) {
            console.error("Login failed:", err);
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center px-4">
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
                        Welcome to BusGoGo
                    </h1>
                    <p className="text-muted-foreground">Login to your account</p>
                </div>

                {/* Login Card */}
                <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-8 border border-primary/10 shadow-2xl shadow-primary/10 backdrop-blur">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm font-medium">
                                {error}
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/60 group-hover:text-primary transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your Email"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-4 py-3.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your Password"
                                    className="w-full bg-input/50 hover:bg-input/70 text-foreground pl-12 pr-12 py-3.5 rounded-xl border border-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-300 placeholder:text-muted-foreground font-medium"
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

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded-lg bg-input border border-primary/20 cursor-pointer accent-primary"
                                />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => navigate("/forgot-password")}
                                className="text-primary hover:text-blue-400 transition-colors font-medium"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/40 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-primary/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-card text-muted-foreground">or continue with</span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                className="px-4 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors font-medium text-foreground"
                            >
                                Google
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2.5 rounded-xl border border-primary/20 hover:bg-primary/5 transition-colors font-medium text-foreground"
                            >
                                Facebook
                            </button>
                        </div>
                    </form>

                    {/* Sign Up Link */}
                    <div className="mt-8 text-center border-t border-primary/10 pt-8">
                        <p className="text-muted-foreground">
                            Don't have an account?{" "}
                            <button
                                onClick={() => navigate("/signup")}
                                className="text-primary hover:text-blue-400 font-bold transition-colors"
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-sm mt-8">
                    By signing in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    )
}
