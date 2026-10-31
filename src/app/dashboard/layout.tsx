import { Toaster } from "@/components/ui/sonner"
import "@/app/globals.css";
import { Navbar } from "@/components/Navbar";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="flex min-h-screen flex-col">
        <Navbar/>
        {children}
        <Toaster position="bottom-right" richColors/>
      </div>
  );
}
