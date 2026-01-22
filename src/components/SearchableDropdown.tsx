import { useState, useRef, useEffect } from "react"
import { ChevronDown, MapPin, Search } from "lucide-react"

interface SearchableDropdownProps {
    value: string
    onChange: (value: string) => void
    options: string[]
    placeholder?: string
    icon?: any
    label: string
}

export default function SearchableDropdown({
    value,
    onChange,
    options,
    placeholder = "Select...",
    icon: Icon = MapPin,
    label
}: SearchableDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Filter options based on search term
    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
                setSearchTerm("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSelect = (option: string) => {
        onChange(option)
        setIsOpen(false)
        setSearchTerm("")
    }

    return (
        <div ref={dropdownRef} className="relative">
            <label className="block text-sm font-semibold text-foreground mb-3">
                {label}
            </label>

            {/* Main Input/Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="relative cursor-pointer"
            >
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary z-10" />
                <div className="w-full bg-input/50 text-foreground pl-12 pr-12 py-4 rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                    <span className={value ? "text-foreground" : "text-muted-foreground"}>
                        {value || placeholder}
                    </span>
                </div>
                <ChevronDown
                    className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <div className="p-3 border-b border-border">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search cities..."
                                className="w-full bg-input/50 text-foreground pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="max-h-60 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleSelect(option)}
                                    className={`px-4 py-3 cursor-pointer transition-colors hover:bg-primary/10 ${value === option ? "bg-primary/5 text-primary font-semibold" : "text-foreground"
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 opacity-50" />
                                        {option}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                                No cities found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
