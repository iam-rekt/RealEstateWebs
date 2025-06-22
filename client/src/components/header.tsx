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
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-blue-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="text-3xl font-extrabold text-blue-600 cursor-pointer tracking-tight leading-tight">Pin-point Real Estate</h1>
                <p className="text-sm text-gray-700 font-medium">Alimos (Athens - South)</p>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:flex space-x-10">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a 
                  className={`text-lg font-semibold transition-all duration-300 tracking-wide ${
                    location === item.href 
                      ? "text-blue-600 border-b-2 border-blue-600 pb-1" 
                      : "text-gray-700 hover:text-blue-600 hover:scale-105"
                  }`}
                  onClick={(e) => {
                    if (item.href.startsWith("/#")) {
                      e.preventDefault();
                      handleNavClick(item.href);
                    }
                  }}
                >
                  {item.name}
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
