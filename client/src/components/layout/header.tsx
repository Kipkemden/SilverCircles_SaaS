import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActivePath = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Logo />

          {/* Mobile Menu Button */}
          <button 
            type="button" 
            className="md:hidden text-neutral-800" 
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/forums" className={`${isActivePath("/forums") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}>
              Forums
            </Link>
            
            {/* Only show these links if user is logged in */}
            {user && (
              <>
                <Link href="/groups" className={`${isActivePath("/groups") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}>
                  Groups
                </Link>
                <Link href="/zoom-calls" className={`${isActivePath("/zoom-calls") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}>
                  Events
                </Link>
                <Link href="/dashboard" className={`${isActivePath("/dashboard") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}>
                  Dashboard
                </Link>
              </>
            )}

            {/* User is not logged in */}
            {!user && (
              <div className="flex space-x-3">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/auth">Log In</Link>
                </Button>
                <Button className="w-full" asChild>
                  <Link href="/auth?signup=true">Sign Up</Link>
                </Button>
              </div>
            )}

            {/* User is logged in */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 text-neutral-800 hover:text-primary">
                    <Avatar className="h-8 w-8">
                      {user.profileImage && 
                        <AvatarImage src={user.profileImage} alt={user.fullName || user.username} />
                      }
                      <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.fullName || user.username}</span>
                    <ChevronDown size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/dashboard" className="w-full">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/profile" className="w-full">
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link href="/settings" className="w-full">
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" asChild>
                        <Link href="/admin" className="w-full">
                          Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-2">
            <nav className="flex flex-col space-y-3">
              {/* Forums link visible to all */}
              <Link 
                href="/forums" 
                className={`${isActivePath("/forums") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Forums
              </Link>
              
              {/* Links visible only to logged in users */}
              {user && (
                <>
                  <Link 
                    href="/dashboard" 
                    className={`${isActivePath("/dashboard") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/groups" 
                    className={`${isActivePath("/groups") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Groups
                  </Link>
                  <Link 
                    href="/zoom-calls" 
                    className={`${isActivePath("/zoom-calls") ? "text-primary" : "text-neutral-800"} hover:text-primary font-medium`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Events
                  </Link>
                </>
              )}
              
              {user ? (
                <>
                  <Link 
                    href="/profile" 
                    onClick={() => setMobileMenuOpen(false)} 
                    className="text-neutral-800 hover:text-primary font-medium"
                  >
                    Profile
                  </Link>
                  {user.isAdmin && (
                    <Link 
                      href="/admin" 
                      onClick={() => setMobileMenuOpen(false)} 
                      className="text-neutral-800 hover:text-primary font-medium"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <a
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-neutral-800 hover:text-primary font-medium cursor-pointer"
                  >
                    Log Out
                  </a>
                </>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Button className="w-full" asChild>
                    <Link href="/auth" onClick={() => setMobileMenuOpen(false)}>
                      Log In
                    </Link>
                  </Button>
                  <Button className="w-full" variant="secondary" asChild>
                    <Link href="/auth?signup=true" onClick={() => setMobileMenuOpen(false)}>
                      Sign Up
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
