import "@/app/globals.css";
import { ToastContainer } from "react-toastify";

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-grid-zinc-100 antialiased flex flex-col h-screen w-full md:w-auto">
      <ToastContainer position="top-right" />
      {/* Header Section */}
      <header className="flex items-center border shadow-lg ring-2 bg-white m-4 mb-2 rounded-full px-4 py-2">
        <div className="flex items-center space-x-0.5">
          <span className="text-3xl font-extrabold text-blue-700">O</span>
          <span className="text-2xl -translate-y-0.25 font-semibold">
            Interview
          </span>
        </div>
      </header>
      {/* Main Content Section */}
      <main className="flex-grow bg-white ring-1 shadow-sm m-4 rounded-lg p-4">
        {children}
      </main>

      <footer className="text-sm text-gray-500 text-center mt-auto mb-2 ">
        © {new Date().getFullYear()} OInterview. All rights reserved.
      </footer>
    </div>
  );
}
