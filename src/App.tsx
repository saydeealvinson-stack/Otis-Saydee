/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Menu as MenuIcon, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  Star,
  ChefHat,
  UtensilsCrossed,
  Truck,
  LogIn,
  LogOut,
  Settings,
  Save,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { cn } from './lib/utils';
import { MENU_ITEMS as STATIC_MENU_ITEMS } from './constants';
import { MenuItem, CartItem } from './types';

import { Logo } from './components/Logo';
import { SplashScreen } from './components/SplashScreen';

// Firebase Imports
import { auth, db } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  User 
} from 'firebase/auth';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';

// --- Components ---

const Navbar = ({ 
  cartCount, 
  onOpenCart, 
  user, 
  onLogin, 
  onLogout 
}: { 
  cartCount: number, 
  onOpenCart: () => void,
  user: User | null,
  onLogin: () => void,
  onLogout: () => void
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = user?.email === "saydeealvinson@gmail.com";

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Dashboard', path: '/admin' });
  }

  return (
    <nav className={cn(
      "fixed top-0 left-0 w-full z-50 transition-all duration-300 px-6 py-4",
      isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Logo className="w-10 h-10 group-hover:rotate-12 transition-transform" />
          <span className={cn(
            "text-2xl font-bold tracking-tight",
            isScrolled ? "text-gray-900" : "text-white"
          )}>
            Saydee<span className="text-orange-500">Food</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-orange-500",
                location.pathname === link.path 
                  ? "text-orange-500" 
                  : isScrolled ? "text-gray-600" : "text-white/90"
              )}
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || ""} 
                  alt={user.displayName || ""} 
                  className="w-8 h-8 rounded-full border border-orange-500"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={onLogout}
                  className={cn(
                    "p-2 rounded-full hover:bg-orange-500/10 transition-colors",
                    isScrolled ? "text-gray-600" : "text-white"
                  )}
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className={cn(
                  "p-2 rounded-full hover:bg-orange-500/10 transition-colors",
                  isScrolled ? "text-gray-600" : "text-white"
                )}
                title="Login"
              >
                <LogIn size={20} />
              </button>
            )}

            <button 
              onClick={onOpenCart}
              className="relative p-2 rounded-full bg-orange-500 text-white hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-500">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={onOpenCart}
            className="relative p-2 rounded-full bg-orange-500 text-white"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-white text-orange-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={cn(isScrolled ? "text-gray-900" : "text-white")}
          >
            {isMobileMenuOpen ? <X size={28} /> : <MenuIcon size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "text-lg font-medium py-2 border-b border-gray-50",
                  location.pathname === link.path ? "text-orange-500" : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <button 
                onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                className="text-lg font-medium py-2 text-red-500 flex items-center gap-2"
              >
                <LogOut size={20} /> Logout
              </button>
            ) : (
              <button 
                onClick={() => { onLogin(); setIsMobileMenuOpen(false); }}
                className="text-lg font-medium py-2 text-orange-500 flex items-center gap-2"
              >
                <LogIn size={20} /> Login
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  cartItems: CartItem[],
  onUpdateQuantity: (id: string, delta: number) => void,
  onRemoveItem: (id: string) => void
}) => {
  const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingBag className="text-orange-500" />
                Your Order
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300">
                    <ShoppingBag size={40} />
                  </div>
                  <div>
                    <p className="text-gray-900 font-medium">Your cart is empty</p>
                    <p className="text-gray-500 text-sm">Add some delicious items to get started!</p>
                  </div>
                  <Link 
                    to="/menu" 
                    onClick={onClose}
                    className="bg-orange-500 text-white px-6 py-2 rounded-full font-medium hover:bg-orange-600 transition-colors"
                  >
                    Browse Menu
                  </Link>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-20 h-20 object-cover rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="font-bold text-orange-600">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <p className="text-xs text-gray-500 mb-3 line-clamp-1">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button 
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-50 text-gray-500"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => onUpdateQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-50 text-gray-500"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <button 
                          onClick={() => onRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-600 p-1"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span className="text-orange-600">${total.toFixed(2)}</span>
                </div>
                <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-2">
                  Place Order Now
                  <ChevronRight size={20} />
                </button>
                <p className="text-center text-xs text-gray-500">
                  By placing your order, you agree to our terms of service.
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// --- Pages ---

const Home = ({ onAddToCart, menuItems }: { onAddToCart: (item: MenuItem) => void, menuItems: MenuItem[] }) => {
  const featuredItems = menuItems.slice(0, 3);

  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero background" 
            className="w-full h-full object-cover brightness-[0.4]"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-400 font-medium backdrop-blur-sm">
              <ChefHat size={18} />
              <span>Gourmet Experience</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
              Delicious Meals <br />
              <span className="text-orange-500">Made Fresh Daily</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-lg">
              Experience the finest culinary delights crafted with passion and the freshest ingredients. From our kitchen to your table.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link 
                to="/menu" 
                className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 flex items-center gap-2"
              >
                Order Now
                <ChevronRight size={20} />
              </Link>
              <Link 
                to="/menu" 
                className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-full font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm"
              >
                View Menu
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating Stats */}
        <div className="absolute bottom-12 left-0 w-full z-10 hidden lg:block">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-3 gap-8 max-w-3xl">
              {[
                { icon: <Star className="text-yellow-400" />, label: "4.9/5 Rating", sub: "From 2k+ reviews" },
                { icon: <Truck className="text-blue-400" />, label: "Fast Delivery", sub: "Within 30-45 mins" },
                { icon: <ChefHat className="text-orange-400" />, label: "Expert Chefs", sub: "15+ years experience" },
              ].map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-white font-bold">{stat.label}</p>
                    <p className="text-white/60 text-sm">{stat.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <h2 className="text-orange-500 font-bold tracking-widest uppercase text-sm">Our Specialties</h2>
            <h3 className="text-4xl font-bold text-gray-900">Featured Dishes</h3>
          </div>
          <Link to="/menu" className="text-orange-500 font-bold flex items-center gap-2 hover:gap-3 transition-all">
            See Full Menu <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredItems.map((item) => (
            <motion.div 
              key={item.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-orange-600 font-bold shadow-sm">
                  ${item.price}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h4 className="text-xl font-bold text-gray-900">{item.name}</h4>
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                  {item.description}
                </p>
                <button 
                  onClick={() => onAddToCart(item)}
                  className="w-full py-3 bg-gray-50 text-gray-900 rounded-xl font-bold hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-orange-50 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-orange-500 font-bold tracking-widest uppercase text-sm">Testimonials</h2>
            <h3 className="text-4xl font-bold text-gray-900">What Our Customers Say</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "Food Critic", text: "The flavors are absolutely incredible. Every bite feels like a journey through culinary excellence.", rating: 5 },
              { name: "Michael Chen", role: "Regular Customer", text: "Best delivery service in town. The food arrives hot and the quality is consistent every single time.", rating: 5 },
              { name: "Emily Davis", role: "Event Planner", text: "We hired them for our corporate event and everyone was blown away. Professional and delicious!", rating: 5 },
            ].map((review, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-orange-100 space-y-6">
                <div className="flex gap-1">
                  {[...Array(review.rating)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                </div>
                <p className="text-gray-600 italic leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <p className="text-gray-500 text-sm">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Menu = ({ onAddToCart, menuItems }: { onAddToCart: (item: MenuItem) => void, menuItems: MenuItem[] }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const categories = ['All', 'Starters', 'Main Dishes', 'Drinks', 'Desserts'];

  const filteredItems = activeCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-gray-900">Our Menu</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Discover our wide range of gourmet dishes, prepared with the finest ingredients and a touch of culinary magic.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-6 py-2 rounded-full font-bold transition-all",
              activeCategory === cat 
                ? "bg-orange-500 text-white shadow-lg shadow-orange-200" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-orange-600 font-bold text-sm shadow-sm">
                  ${item.price}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 flex-1">
                  {item.description}
                </p>
                <button 
                  onClick={() => onAddToCart(item)}
                  className="w-full py-2 bg-orange-50 text-orange-600 rounded-xl font-bold text-sm hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const About = () => {
  return (
    <div className="pt-32 pb-24 space-y-24">
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-orange-500 font-bold tracking-widest uppercase text-sm">Our Story</h2>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Crafting Culinary <br />
              <span className="text-orange-500">Masterpieces Since 2022</span>
            </h1>
          </div>
          <p className="text-gray-600 text-lg leading-relaxed">
            Founded in a small kitchen with a big dream, Saydee Food has grown into a beloved culinary destination. Our journey began with a simple mission: to bring people together through the power of exceptional food.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed">
            We believe that every meal should be an experience. That's why we source our ingredients from local farmers, prioritize sustainable practices, and never compromise on quality.
          </p>
          <div className="grid grid-cols-2 gap-8 pt-4">
            <div>
              <p className="text-4xl font-bold text-orange-500">15+</p>
              <p className="text-gray-500 font-medium">Years of Passion</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-orange-500">50k+</p>
              <p className="text-gray-500 font-medium">Happy Customers</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-full h-full border-2 border-orange-500 rounded-3xl z-0" />
          <img 
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1000" 
            alt="Our kitchen" 
            className="relative z-10 w-full h-[500px] object-cover rounded-3xl shadow-2xl"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <section className="bg-gray-900 py-24 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-orange-500 font-bold tracking-widest uppercase text-sm">Our Values</h2>
            <h3 className="text-4xl font-bold">What Drives Us</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Quality First", desc: "We only use the freshest, hand-picked ingredients for every dish.", icon: <Star className="text-orange-500" size={32} /> },
              { title: "Local Sourcing", desc: "Supporting our community by partnering with local farmers and suppliers.", icon: <MapPin className="text-orange-500" size={32} /> },
              { title: "Culinary Innovation", desc: "Constantly exploring new flavors and techniques to surprise your palate.", icon: <ChefHat className="text-orange-500" size={32} /> },
            ].map((value, i) => (
              <div key={i} className="space-y-6">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/10">
                  {value.icon}
                </div>
                <h4 className="text-xl font-bold">{value.title}</h4>
                <p className="text-gray-400 leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Gallery = () => {
  const images = [
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1473093226795-af9932fe5856?auto=format&fit=crop&q=80&w=800",
  ];

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-gray-900">Visual Feast</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Take a look at our kitchen, our team, and of course, our delicious creations.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((img, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.02 }}
            className="relative h-80 rounded-3xl overflow-hidden shadow-lg"
          >
            <img 
              src={img} 
              alt={`Gallery ${i}`} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Instagram className="text-white" size={32} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Contact = () => {
  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-16">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold text-gray-900">Get In Touch</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          Have a question or want to book a table? We'd love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Location</h4>
                <p className="text-gray-500">123 Gourmet Ave, Food City, FC 45678</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Phone</h4>
                <p className="text-gray-500">+1 (555) 123-4567</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Email</h4>
                <p className="text-gray-500">hello@savorybites.com</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 shrink-0">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Hours</h4>
                <p className="text-gray-500">Mon-Fri: 10am - 10pm</p>
                <p className="text-gray-500">Sat-Sun: 9am - 11pm</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center lg:justify-start">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-12 h-12 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors">
                <Icon size={20} />
              </a>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          <form className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Subject</label>
              <input 
                type="text" 
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Message</label>
              <textarea 
                rows={5}
                placeholder="Your message here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
              />
            </div>
            <button className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <Logo className="w-10 h-10" />
              <span className="text-2xl font-bold tracking-tight">
                Saydee<span className="text-orange-500">Food</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Crafting exceptional culinary experiences with passion and quality ingredients since 2010.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-lg font-bold">Quick Links</h4>
            <ul className="space-y-4 text-gray-400">
              <li><Link to="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
              <li><Link to="/menu" className="hover:text-orange-500 transition-colors">Menu</Link></li>
              <li><Link to="/about" className="hover:text-orange-500 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-orange-500 transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Contact Info</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3"><MapPin size={18} className="text-orange-500" /> 17th Sinkor Ave, Food City</li>
              <li className="flex items-center gap-3"><Phone size={18} className="text-orange-500" /> 231881143489</li>
              <li className="flex items-center gap-3"><Mail size={18} className="text-orange-500" /> hello@saydeefood.com</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-lg font-bold">Newsletter</h4>
            <p className="text-gray-400">Subscribe for updates and special offers.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Your email"
                className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 outline-none focus:border-orange-500 flex-1"
              />
              <button className="bg-orange-500 p-2 rounded-lg hover:bg-orange-600 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-gray-500 text-sm">
          <p>© 2026 Saydee Food. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Admin Dashboard ---

const AdminDashboard = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    price: 0,
    description: '',
    category: 'Main Dishes',
    image: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await updateDoc(doc(db, 'menu', editingItem.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'menu'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
      setIsAdding(false);
      setEditingItem(null);
      setFormData({ name: '', price: 0, description: '', category: 'Main Dishes', image: '' });
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Failed to save item. Check permissions.");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, 'menu', id));
      } catch (error) {
        console.error("Error deleting item:", error);
      }
    }
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData(item);
    setIsAdding(true);
  };

  return (
    <div className="pt-32 pb-24 max-w-7xl mx-auto px-6 space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage your menu items and prices in real-time.</p>
        </div>
        <button 
          onClick={() => { setIsAdding(true); setEditingItem(null); setFormData({ name: '', price: 0, description: '', category: 'Main Dishes', image: '' }); }}
          className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center gap-2 shadow-lg shadow-orange-200"
        >
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-orange-100 space-y-6"
          >
            <h2 className="text-2xl font-bold text-gray-900">
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Item Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Price ($)</label>
                <input 
                  required
                  type="number" 
                  step="0.01"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as any})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                >
                  <option>Starters</option>
                  <option>Main Dishes</option>
                  <option>Drinks</option>
                  <option>Desserts</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Image URL</label>
                <input 
                  required
                  type="url" 
                  value={formData.image}
                  onChange={e => setFormData({...formData, image: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-bold text-gray-700">Description</label>
                <textarea 
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 outline-none resize-none"
                />
              </div>
              <div className="md:col-span-2 flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingItem ? 'Update Item' : 'Save Item'}
                </button>
                <button 
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingItem(null); }}
                  className="px-8 py-4 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col">
            <div className="relative h-48 overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                {item.category}
              </div>
            </div>
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                <p className="font-bold text-orange-600">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => startEdit(item)}
                  className="flex-1 py-2 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                >
                  <Settings size={16} />
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSplashComplete, setIsSplashComplete] = useState(false);

  // Firebase State
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string, type: 'error' | 'success' } | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Firestore Menu Listener
  useEffect(() => {
    const q = query(collection(db, 'menu'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MenuItem[];
      
      // Fallback to static items if Firestore is empty
      setMenuItems(items.length > 0 ? items : STATIC_MENU_ITEMS);
    }, (error) => {
      console.error("Firestore Error:", error);
      // Fallback on error
      setMenuItems(STATIC_MENU_ITEMS);
    });
    return () => unsubscribe();
  }, []);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setNotification({ message: "Welcome back!", type: 'success' });
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setNotification({ message: "Login was cancelled. Please try again.", type: 'error' });
      } else if (error.code === 'auth/popup-blocked') {
        setNotification({ message: "Login popup was blocked by your browser.", type: 'error' });
      } else {
        setNotification({ message: "An error occurred during login. Please try again.", type: 'error' });
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isAdmin = user?.email === "saydeealvinson@gmail.com";

  return (
    <>
      <AnimatePresence>
        {!isSplashComplete && (
          <SplashScreen onComplete={() => setIsSplashComplete(true)} />
        )}
      </AnimatePresence>

      {isSplashComplete && (
        <Router>
          <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-600">
            <Navbar 
              cartCount={cartCount} 
              onOpenCart={() => setIsCartOpen(true)} 
              user={user}
              onLogin={handleLogin}
              onLogout={handleLogout}
            />
            
            <main>
              <Routes>
                <Route path="/" element={<Home onAddToCart={addToCart} menuItems={menuItems} />} />
                <Route path="/menu" element={<Menu onAddToCart={addToCart} menuItems={menuItems} />} />
                <Route path="/about" element={<About />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/contact" element={<Contact />} />
                {isAdmin && (
                  <Route path="/admin" element={<AdminDashboard menuItems={menuItems} />} />
                )}
              </Routes>
            </main>

            <Footer />

            <CartDrawer 
              isOpen={isCartOpen} 
              onClose={() => setIsCartOpen(false)} 
              cartItems={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
            />

            {/* Notification Toast */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ opacity: 0, y: 50, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 50, x: '-50%' }}
                  className={cn(
                    "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
                    notification.type === 'error' 
                      ? "bg-red-50 border-red-100 text-red-600" 
                      : "bg-green-50 border-green-100 text-green-600"
                  )}
                >
                  {notification.type === 'error' ? <AlertCircle size={20} /> : <Star size={20} className="fill-green-600" />}
                  <span className="font-bold">{notification.message}</span>
                  <button onClick={() => setNotification(null)} className="ml-2 hover:opacity-70">
                    <X size={18} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Router>
      )}
    </>
  );
}
