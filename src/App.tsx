import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/contexts/AuthContext"

// Pages
import SelectVehiclePage from "@/pages/SelectVehiclePage"
import SearchPage from "@/pages/SearchPage"
import VehiclesPage from "@/pages/VehiclesPage"
import SeatSelectionPage from "@/pages/SeatSelectionPage"
import PaymentPage from "@/pages/PaymentPage"
import TicketPage from "@/pages/TicketPage"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/SignupPage"
import ProfilePage from "@/pages/ProfilePage"
import BookingDetailPage from "@/pages/BookingDetailPage"
import BookingSuccessPage from "@/pages/BookingSuccessPage"

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Multi-step Booking Flow */}
          <Route path="/" element={<SelectVehiclePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/seats/:id" element={<SeatSelectionPage />} />
          <Route path="/payment/:id" element={<PaymentPage />} />
          <Route path="/ticket/:id" element={<TicketPage />} />

          {/* Auth Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Legacy Routes (for existing bookings) */}
          <Route path="/booking/:id" element={<BookingDetailPage />} />
          <Route path="/booking-success" element={<BookingSuccessPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
