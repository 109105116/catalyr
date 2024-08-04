export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container bg-background relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {children}
    </div>
  );
}
