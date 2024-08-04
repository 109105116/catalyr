import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <main className="flex mx-auto pt-32 w-fit flex-col items-center">
        {children}
        <Toaster />
      </main>
    </>
  );
}
