import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Heart, MessageSquare, PlusCircle, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getCurrentUser, signOut, supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@/lib/supabase';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isSearchPage = location.pathname === '/search';

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          setUser(data);
        }
      } catch {
        // Auth/network error — показываем как неавторизованного
      }
    };

    loadUser();

    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    try {
      const result = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          supabase.from('users').select('*').eq('id', session.user.id).single()
            .then(({ data }) => setUser(data), () => {});
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      });
      authListener = result.data;
    } catch {
      // ignore
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { label: 'Купить', href: '/search' },
    { label: 'Продать', href: '/create-listing' },
    { label: 'Автосалоны', href: '/dealers' },
    { label: 'Проверка авто', href: '/vin-check' },
  ];

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-[#1a365d] shadow-md transition-shadow duration-300"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#2563eb] to-[#f97316] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-white">
              AutoHub
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="font-medium text-white/90 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop (hidden on search page) */}
          {!isSearchPage && (
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск по марке, модели..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:bg-white/15 focus:border-white/30"
              />
            </div>
          </form>
          )}

          {/* User Actions */}
          <div className="flex items-center gap-2 lg:gap-4">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex text-white hover:bg-white/10"
                  onClick={() => navigate('/favorites')}
                >
                  <Heart className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden lg:flex text-white hover:bg-white/10"
                  onClick={() => navigate('/messages')}
                >
                  <MessageSquare className="w-5 h-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 text-white hover:bg-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563eb] to-[#f97316] flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.first_name?.[0] || user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <span className="hidden lg:inline font-medium">
                        {user.first_name || user.email.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Профиль
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile?tab=listings')}>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Мои объявления
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favorites')}>
                      <Heart className="w-4 h-4 mr-2" />
                      Избранное
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Сообщения
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                  onClick={() => navigate('/auth')}
                >
                  Войти
                </Button>
                <Button
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                  onClick={() => navigate('/auth?tab=register')}
                >
                  Регистрация
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4">
            {/* Mobile Search (hidden on search page) */}
            {!isSearchPage && (
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по марке, модели..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
            </form>
            )}

            {/* Mobile Nav Links */}
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="py-2 px-4 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Mobile Auth */}
            {!user && (
              <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" onClick={() => navigate('/auth')}>
                  Войти
                </Button>
                <Button
                  className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                  onClick={() => navigate('/auth?tab=register')}
                >
                  Регистрация
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
