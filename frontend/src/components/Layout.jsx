import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Fixed Dark Sidebar */}
      <Sidebar />

      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Fixed Top Navbar */}
        <Navbar />

        {/* Scrollable Page Body */}
        <main className="flex-1 pt-20 px-8 pb-12 bg-white min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
