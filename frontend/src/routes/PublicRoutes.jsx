import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Home = lazy(() => import('../pages/Home'));
const Search = lazy(() => import('../pages/Search'));
const ProList = lazy(() => import('../pages/ProList'));
const ProDetail = lazy(() => import('../pages/ProDetail'));
const AuthLogin = lazy(() => import('../pages/AuthLogin'));
const AuthRegisterClient = lazy(() => import('../pages/AuthRegisterClient'));
const AuthRegisterPro = lazy(() => import('../pages/AuthRegisterPro'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const FAQ = lazy(() => import('../pages/FAQ'));
const Legal = lazy(() => import('../pages/Legal'));
const Terms = lazy(() => import('../pages/Terms'));
const Privacy = lazy(() => import('../pages/Privacy'));

const PublicRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/search" element={<Search />} />
      <Route path="/pros" element={<ProList />} />
      <Route path="/pro/:id" element={<ProDetail />} />
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<AuthRegisterClient />} />
      <Route path="/register/pro" element={<AuthRegisterPro />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/legal" element={<Legal />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
};

export default PublicRoutes;
