"use client"


import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "react-router-dom"

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Facebook, Instagram, Linkedin, Send, Twitter } from "lucide-react"

function Footerdemo() {
    return (
        <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
            <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative">
                        <h2 className="mb-4 text-3xl font-bold tracking-tight text-primary">NutriLife</h2>
                        <p className="mb-6 text-muted-foreground">
                            Your personal AI nutrition companion. Transform your health, one meal at a time.
                        </p>
                        <form className="relative">
                            <Input
                                type="email"
                                placeholder="Join our newsletter"
                                className="pr-12 backdrop-blur-sm rounded-xl"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                            >
                                <Send className="h-4 w-4" />
                                <span className="sr-only">Subscribe</span>
                            </Button>
                        </form>
                        <div className="absolute -right-4 top-0 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
                        <nav className="space-y-2 text-sm font-medium">
                            <Link to="/" className="block transition-colors hover:text-primary">
                                Home
                            </Link>
                            <Link to="/dashboard" className="block transition-colors hover:text-primary">
                                Dashboard
                            </Link>
                            <Link to="/meals" className="block transition-colors hover:text-primary">
                                Meal Logger
                            </Link>
                            <Link to="/diet" className="block transition-colors hover:text-primary">
                                Diet Plan
                            </Link>
                            <Link to="/workouts" className="block transition-colors hover:text-primary">
                                Workouts
                            </Link>
                            <Link to="/pricing" className="block transition-colors hover:text-primary">
                                Pricing
                            </Link>
                            <Link to="/about" className="block transition-colors hover:text-primary">
                                About Us
                            </Link>
                        </nav>
                    </div>
                    <div>
                        <h3 className="mb-4 text-lg font-semibold">Contact Support</h3>
                        <address className="space-y-3 text-sm not-italic text-muted-foreground">
                            <div>
                                <p className="font-bold text-foreground">Aagam Shah</p>
                                <p className="text-xs">Student</p>
                            </div>
                            <p>SMJV Ahmedabad, opposite Paldi Bus Stand</p>
                            <p className="font-medium text-primary">+91 9586149171</p>
                            <p>Email: support@nutrilife.ai</p>
                        </address>
                    </div>
                    <div className="relative">
                        <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
                        <div className="mb-6 flex space-x-4">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-all">
                                                <Facebook className="h-4 w-4" />
                                                <span className="sr-only">Facebook</span>
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Facebook</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-all">
                                                <Twitter className="h-4 w-4" />
                                                <span className="sr-only">Twitter</span>
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Twitter</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-all">
                                                <Instagram className="h-4 w-4" />
                                                <span className="sr-only">Instagram</span>
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Follow us on Instagram</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="icon" className="rounded-full hover:bg-primary hover:text-white transition-all">
                                                <Linkedin className="h-4 w-4" />
                                                <span className="sr-only">LinkedIn</span>
                                            </Button>
                                        </a>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Connect with us on LinkedIn</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export { Footerdemo }
