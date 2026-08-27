import React, { useState } from 'react';
import { PosProvider, usePos } from './context/PosContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PosView } from './components/PosView';
import { InventoryView } from './components/InventoryView';
import { SalesHistoryView } from './components/SalesHistoryView';
import { ReportsView } from './components/ReportsView';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { Footer } from './components/Footer';
import { PaymentMethod } from './types';

const MainLayout: React.FC = () => {
  const { activeTab } = usePos();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('QRIS');
  const [discountValue, setDiscountValue] = useState(0);

  const handleOpenPayment = (method: PaymentMethod, discount: number) => {
    setSelectedMethod(method);
    setDiscountValue(discount);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden select-none">
      {/* Left Deep Indigo Navigation Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Views */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {activeTab === 'pos' && <PosView onOpenPaymentModal={handleOpenPayment} />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'history' && <SalesHistoryView />}
          {activeTab === 'reports' && <ReportsView />}
        </div>

        {/* Bottom System Status Bar */}
        <Footer />
      </main>

      {/* Global Modals and Drawers */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        initialMethod={selectedMethod}
        discount={discountValue}
      />
      <ReceiptModal />
      <AlertsDrawer />
    </div>
  );
};

export default function App() {
  return (
    <PosProvider>
      <MainLayout />
    </PosProvider>
  );
}
