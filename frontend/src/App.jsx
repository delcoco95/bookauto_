import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import Header from './components/Header';
import Footer from './components/Footer';

// Lazy load routes
const PublicRoutes = lazy(() => import('./routes/PublicRoutes'));
const ClientRoutes = lazy(() => import('./routes/ClientRoutes'));
const ProRoutes = lazy(() => import('./routes/ProRoutes'));

// Loading component
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
);

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Header />
          
          <main className="flex-grow">
            <Suspense fallback={<Loading />}>
              <Routes>
                {/* Public routes */}
                <Route path="/*" element={<PublicRoutes />} />
                
                {/* Client dashboard routes */}
                <Route path="/client/*" element={<ClientRoutes />} />
                
                {/* Pro dashboard routes */}
                <Route path="/pro/*" element={<ProRoutes />} />
              </Routes>
            </Suspense>
          </main>
          
          <Footer />
        </div>
      </AuthProvider>
    </UIProvider>
  );
}

export default App;
