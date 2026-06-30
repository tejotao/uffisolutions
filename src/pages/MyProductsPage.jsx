import React from 'react';
import Header from '@/components/uffi/Header';
import Footer from '@/components/uffi/Footer';
import MyProducts from '@/components/sections/MyProducts';

export default function MyProductsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col">
      <Header />
      <main className="flex-grow pt-20">
        <MyProducts />
      </main>
      <Footer />
    </div>
  );
}