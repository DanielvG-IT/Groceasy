export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="flex justify-between items-center p-4 shadow bg-white">
        <h1 className="text-xl font-bold">Groceasy</h1>
        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
      </header>
      <main>{children}</main>
    </div>
  );
}
