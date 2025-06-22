import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Properties", href: "/properties" },
    { name: "Services", href: "/#services" },
    { name: "About", href: "/#about" },
    { name: "Contact", href: "/#contact" },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#")) {
      const element = document.querySelector(href.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-2xl border-b border-gray-100/50 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center group">
            <div className="flex-shrink-0">
              <Link href="/">
                <div className="cursor-pointer transition-transform duration-300 group-hover:scale-105">
                  <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                    Pin-point <span className="text-blue-600">Estate</span>
                  </h1>
                  <p className="text-xs text-gray-500 font-medium tracking-wider uppercase">Athens • Premium Properties</p>
                </div>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`relative text-sm font-medium tracking-wide transition-all duration-500 group ${
                    location === item.href 
                      ? "text-blue-600" 
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={(e) => {
                    if (item.href.startsWith("/#")) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                  }}
                >
                  {item.name}
                  <span className={`absolute -bottom-2 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${
                    location === item.href 
                      ? "w-full" 
                      : "w-0 group-hover:w-full"
                  }`}></span>
                </a>
              </Link>
            ))}
          </nav>
          
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-8">
                  {navigation.map((item) => (
                    <Link key={item.name} href={item.href}>
                      <a 
                        className={`block px-4 py-3 text-xl font-semibold rounded-xl transition-all duration-300 tracking-wide ${
                          location === item.href 
                            ? "text-blue-600 bg-blue-50 border-l-4 border-blue-600" 
                            : "text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:scale-105"
                        }`}
                        onClick={(e) => {
                          if (item.href.startsWith("/#")) {
                            e.preventDefault();
                            handleNavClick(item.href);
                          } else {
                            setMobileMenuOpen(false);
                          }
                        }}
                      >
                        {item.name}
                      </a>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
