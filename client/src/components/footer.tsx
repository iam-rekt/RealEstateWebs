import { Link } from "wouter";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const handleScrollToSection = (sectionId: string) => {
    const element = document.querySelector(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Fetch site settings for dynamic footer content
  const { data: settingsData } = useQuery({
    queryKey: ["/api/site-settings"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Use settings data directly since it's already in the correct format
  const settings = settingsData ? (settingsData as Record<string, string>) : {} as Record<string, string>;

  // Fallback values
  const companyName = settings.footer_company_name || "شركة رند للاستثمار العقاري و تطويره";
  const companyDescription = settings.footer_description || "شريكك الموثوق في الأراضي في عمان. نتخصص في ربط المشترين والمستثمرين بالأراضي الاستثنائية في جميع أنحاء منطقة عمان الكبرى.";
  const address = settings.footer_address || "الصويفية - مجمع فرح التجاري - الطابق الثاني";
  const phone = settings.footer_phone || "+962 6 5826440";
  const fax = settings.footer_fax || "+962 6 5826408";
  const mobile1 = settings.footer_mobile1 || "+962 79 5566030";
  const mobile2 = settings.footer_mobile2 || "+962 77 5566030";
  const poBox = settings.footer_po_box || "ص.ب: 37 عمان 11831 الأردن";
  const manager = settings.footer_manager || "المدير العام: فؤاد حدادين";
  const workingHours = settings.footer_working_hours || "الأحد إلى الخميس\n9:30 صباحاً - 5:00 مساءً";
  const email = settings.footer_email || "info@randrealestate.com";
  const website = settings.footer_website || "www.randrealestate.com";
  const facebookUrl = settings.footer_social_facebook || "#";
  const instagramUrl = settings.footer_social_instagram || "#";
  const linkedinUrl = settings.footer_social_linkedin || "#";

  return (
    <footer className="bg-text-primary text-white py-12" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h5 className="text-2xl font-bold mb-4 text-black">{companyName}</h5>
            <p className="text-black mb-4">
              {companyDescription}
            </p>
            <div className="flex space-x-4 space-x-reverse justify-end">
              <a href={facebookUrl || "#"} target={facebookUrl && facebookUrl !== "#" ? "_blank" : "_self"} rel="noopener noreferrer" className="text-black hover:text-gray-600 transition-colors duration-200">
                <Facebook className="h-6 w-6" />
              </a>
              <a href={instagramUrl || "#"} target={instagramUrl && instagramUrl !== "#" ? "_blank" : "_self"} rel="noopener noreferrer" className="text-black hover:text-gray-600 transition-colors duration-200">
                <Instagram className="h-6 w-6" />
              </a>
              <a href={linkedinUrl || "#"} target={linkedinUrl && linkedinUrl !== "#" ? "_blank" : "_self"} rel="noopener noreferrer" className="text-black hover:text-gray-600 transition-colors duration-200">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4 text-black">روابط سريعة</h6>
            <ul className="space-y-2 text-black">
              <li>
                <Link href="/properties">
                  <span className="hover:text-gray-600 transition-colors duration-200 cursor-pointer">العقارات</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#services")}
                  className="hover:text-gray-600 transition-colors duration-200 text-right"
                >
                  الخدمات
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#about")}
                  className="hover:text-gray-600 transition-colors duration-200 text-right"
                >
                  من نحن
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleScrollToSection("#contact")}
                  className="hover:text-gray-600 transition-colors duration-200 text-right"
                >
                  اتصل بنا
                </button>
              </li>
            </ul>
          </div>
          
          <div>
            <h6 className="font-semibold mb-4 text-black">معلومات الاتصال</h6>
            <ul className="space-y-2 text-black">
              <li>{address}</li>
              <li>الهاتف: {phone}</li>
              <li>الفاكس: {fax}</li>
              <li>الجوال: {mobile1}</li>
              <li>الجوال: {mobile2}</li>
              <li>{poBox}</li>
              <li>{manager}</li>
              <li className="mt-3 pt-2 border-t border-gray-500">
                <strong>أوقات العمل:</strong><br />
                {workingHours.split('\n').map((line, index) => (
                  <span key={index}>
                    {line}
                    {index < workingHours.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="border-gray-600 my-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-black text-sm">&copy; 2024 {companyName}. جميع الحقوق محفوظة.</p>
          <div className="flex space-x-6 space-x-reverse mt-4 md:mt-0">
            <a href="#" className="text-black hover:text-gray-600 text-sm transition-colors duration-200">
              سياسة الخصوصية
            </a>
            <a href="#" className="text-black hover:text-gray-600 text-sm transition-colors duration-200">
              شروط الخدمة
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
