import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Estado from './components/Estado';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

// Pantallas poco usadas: se descargan solo cuando se visitan.
const Orders = lazy(() => import('./pages/Orders'));
const ProductAdmin = lazy(() => import('./pages/ProductAdmin'));
const RabbitAdmin = lazy(() => import('./pages/RabbitAdmin'));

function ScrollArriba() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollArriba />
      <Header />
      <main className="contenido">
        <ErrorBoundary>
          <Suspense fallback={<Estado tipo="cargando" texto="Cargando..." />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Products />} />
              <Route path="/productos/:id" element={<ProductDetail />} />
              <Route path="/carrito" element={<Cart />} />
              <Route path="/pedidos" element={<Orders />} />
              <Route path="/gestion" element={<ProductAdmin />} />
              <Route path="/rabbit" element={<RabbitAdmin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
