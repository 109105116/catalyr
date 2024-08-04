import { Footer } from "@/components/footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-full flex-col flex-between">
      <main className="flex flex-1 mx-auto mb-40 pt-32 w-fit flex-col items-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
