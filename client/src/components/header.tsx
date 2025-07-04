import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
// Logo will be loaded from public folder

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch site settings for dynamic tagline
  const { data: settingsData } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const settings = settingsData ? (settingsData as Record<string, string>) : {} as Record<string, string>;
  const tagline = settings.footer_tagline || "الأراضي في الأردن";

  const navigation = [
    { name: "العقارات", href: "/properties" },
    { name: "الخدمات", href: "/#services" },
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
                <div className="cursor-pointer transition-transform duration-300 group-hover:scale-105 flex items-center space-x-4">
                  <img 
                    src="/logo.png" 
                    alt="شركة رند للاستثمار العقاري و تطويره" 
                    className="h-12 w-auto object-contain"
                  />
                  <div className="text-right">
                    <h1 className="text-lg font-bold text-gray-800 tracking-wide">شركة رند للاستثمار العقاري و تطويره</h1>
                    <p className="text-xs text-gray-500 font-medium">الأردن • {tagline}</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-12">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <span 
                  className={`relative text-sm font-medium tracking-wide transition-all duration-500 group cursor-pointer ${
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
                </span>
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
                    <button
                      key={item.name}
                      className={`block px-4 py-3 text-xl font-semibold rounded-xl transition-all duration-300 tracking-wide text-right ${
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
                          window.location.href = item.href;
                        }
                      }}
                    >
                      {item.name}
                    </button>
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
