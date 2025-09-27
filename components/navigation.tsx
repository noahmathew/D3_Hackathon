"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Phone, Calendar, User, BookOpen, MapPin, Activity } from "lucide-react"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: null },
    { href: "/appointments", label: "Book Appointment", icon: Calendar },
    { href: "/doctors", label: "Our Doctors", icon: User },
    { href: "/patient-portal", label: "Patient Portal", icon: User },
    { href: "/operations", label: "Operations Dashboard", icon: Activity },
    { href: "/health-resources", label: "Health Resources", icon: BookOpen },
    { href: "/contact", label: "Contact", icon: MapPin },
  ]

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">H</span>
            </div>
            <span className="font-semibold text-xl text-foreground">HealthCare Plus</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}
            <Button className="ml-4">
              <Phone className="w-4 h-4 mr-2" />
              Emergency: (555) 123-4567
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-card border-t border-border">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-3 py-2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-2">
                    {item.icon && <item.icon className="w-4 h-4" />}
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
              <div className="px-3 py-2">
                <Button className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency: (555) 123-4567
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
