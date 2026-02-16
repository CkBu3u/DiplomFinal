import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/sections/Hero';
import { BrandGrid } from '@/sections/BrandGrid';
import { FeaturedListings } from '@/sections/FeaturedListings';
import { BodyTypes } from '@/sections/BodyTypes';
import { NewArrivals } from '@/sections/NewArrivals';
import { Features } from '@/sections/Features';
import { HowItWorks } from '@/sections/HowItWorks';
import { SearchPage } from '@/pages/SearchPage';
import { ListingPage } from '@/pages/ListingPage';
import { AuthPage } from '@/pages/AuthPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { CreateListingPage } from '@/pages/CreateListingPage';
import { VinCheckPage } from '@/pages/VinCheckPage';
import { DealersPage } from '@/pages/DealersPage';
import { ComparePage } from '@/pages/ComparePage';
import { AboutPage } from '@/pages/AboutPage';
import { HelpPage } from '@/pages/HelpPage';
import { FavoritesPage } from '@/pages/FavoritesPage';
import { MessagesPage } from '@/pages/MessagesPage';

function HomePage() {
  return (
    <>
      <Hero />
      <BrandGrid />
      <FeaturedListings />
      <BodyTypes />
      <NewArrivals />
      <Features />
      <HowItWorks />
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/listing/:id" element={<ListingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-listing" element={<CreateListingPage />} />
            <Route path="/vin-check" element={<VinCheckPage />} />
            <Route path="/dealers" element={<DealersPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/help" element={<HelpPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
