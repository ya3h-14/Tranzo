import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ChevronRight, Truck, Shield, Globe, Award, BarChart3, TrendingUp, Zap, Clock, Users, MapPin } from 'lucide-react';
import { Logo } from '@/components/Logo';

// Import local banner images
import banner1 from '@/assets/banner1.jpg';
import banner2 from '@/assets/banner2.jpg';
import banner3 from '@/assets/banner3.jpg';
import banner4 from '@/assets/banner4.jpg';

// Import fleet images
import crane from '@/assets/crane.webp';
import excavators from '@/assets/excavators.webp';
import van from '@/assets/van.jpg';
import cargo from '@/assets/cargo.jpg';
import minitruck from '@/assets/minitruck.webp';

export default function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const heroSlides = [banner1, banner2, banner3, banner4];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const vehicles = [
    { title: 'Heavy Trucks', icon: banner1, category: 'INDUSTRIAL GRADE' },
    { title: 'Industrial Cranes', icon: crane, category: 'INDUSTRIAL GRADE' },
    { title: 'Excavators', icon: excavators, category: 'INDUSTRIAL GRADE' },
    { title: 'Logistics Van', icon: van, category: 'CITY LOGISTICS' },
    { title: 'Cargo Carrier', icon: cargo, category: 'INDUSTRIAL GRADE' },
    { title: 'Mini Truck', icon: minitruck, category: 'CITY LOGISTICS' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-amber-500 selection:text-black antialiased overflow-x-hidden">
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 lg:px-16 transition-all duration-500 ${
        isScrolled ? 'backdrop-blur-xl bg-black/80 border-b border-white/5 py-3' : 'backdrop-blur-lg bg-black/20 border-b border-white/10'
      }`}>
        <div onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="cursor-pointer">
          <Logo variant="light" className="scale-90 lg:scale-100 origin-left drop-shadow-2xl" />
        </div>
        <div className="flex items-center space-x-8">
          <div className="hidden lg:flex items-center space-x-6 text-white/80 text-[11px] font-bold tracking-[0.2em] uppercase">
             <button onClick={() => scrollToSection('fleet')} className="hover:text-amber-500 transition-colors">Fleet</button>
             <button onClick={() => scrollToSection('services')} className="hover:text-amber-500 transition-colors">Services</button>
             <button onClick={() => scrollToSection('about')} className="hover:text-amber-500 transition-colors">About</button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="text-white text-xs font-bold tracking-widest hover:text-amber-500 transition-colors px-4"
            >
              LOGIN
            </button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-black font-black px-8 py-3 rounded-full transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/20"
              onClick={() => navigate('/auth/customer/register')}
            >
              GET STARTED
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden bg-slate-950">
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 z-0 transition-all duration-[2000ms] ease-out ${
              index === currentSlide ? 'opacity-40 scale-105' : 'opacity-0 scale-110'
            }`}
          >
            <img src={slide} className="w-full h-full object-cover" alt="" />
          </div>
        ))}

        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20"></div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-l from-slate-950/90 via-slate-950/40 to-transparent"></div>

        <div className="relative z-10 container mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 h-full items-center pt-20">
          <div className="lg:col-span-6 hidden lg:block"></div>

          <div className="lg:col-span-6 text-white flex flex-col items-start lg:items-end text-left lg:text-right space-y-6">
            <div className="space-y-2">
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-none uppercase">
                Mobility <span className="text-amber-500">Solutions</span>
              </h1>
              <div className="flex items-center lg:justify-end py-1">
                 <span className="text-[11px] font-bold tracking-[0.6em] text-white/50 uppercase">Beyond Boundaries</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-none uppercase">
                Build Our Nation
              </h1>
            </div>

            <p className="text-base lg:text-lg text-white/70 font-medium leading-relaxed max-w-md lg:ml-auto">
              Engineering the next generation of industrial logistics with India's most advanced commercial fleet.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 hover:border-white text-white bg-white/5 hover:bg-white hover:text-black h-14 px-10 text-sm font-bold uppercase rounded-full transition-all backdrop-blur-sm w-full sm:w-auto"
                onClick={() => navigate('/auth/driver/register')}
              >
                Join Fleet
              </Button>
              <Button
                size="lg"
                className="bg-amber-500 hover:bg-amber-600 text-black font-black h-14 px-12 text-sm tracking-widest uppercase rounded-full transition-all shadow-xl shadow-amber-500/20 hover:scale-105 w-full sm:w-auto"
                onClick={() => navigate('/auth/customer/register')}
              >
                Book Vehicle <ArrowRight className="ml-2" size={18} />
              </Button>
            </div>

            <div className="flex items-center space-x-4 pt-12">
               {heroSlides.map((_, index) => (
                 <button
                   key={index}
                   onClick={() => setCurrentSlide(index)}
                   className="relative py-2 group"
                 >
                   <div className={`h-[3px] transition-all duration-700 rounded-full ${
                     index === currentSlide ? 'w-12 bg-amber-500' : 'w-3 bg-white/20 group-hover:bg-white/40'
                   }`}></div>
                 </button>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Industrial Features Bar */}
      <section className="bg-white py-16 px-6 border-b border-slate-100">
        <div className="container mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {[
            { label: 'Asset Utilization', value: '98.4%', icon: <BarChart3 className="text-amber-500" /> },
            { label: 'Cities Operations', value: '250+', icon: <Globe className="text-amber-500" /> },
            { label: 'Safety Index', value: 'A++', icon: <Shield className="text-amber-500" /> },
            { label: 'Market Growth', value: '+42%', icon: <TrendingUp className="text-amber-500" /> },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center space-y-3">
              <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 transition-all duration-500">
                 {stat.icon}
              </div>
              <div className="text-center">
                <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{stat.value}</div>
                <div className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6 lg:px-16 bg-white overflow-hidden">
        <div className="container mx-auto">
          <div className="flex flex-col items-center text-center mb-20 space-y-4">
            <span className="text-amber-600 font-black text-xs tracking-widest uppercase">Our Services</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">
              End-to-End Industrial Logistics
            </h2>
            <div className="h-1 w-20 bg-amber-500 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: 'Heavy Hauling',
                desc: 'Specialized transportation for oversized and heavy industrial equipment with real-time tracking.',
                icon: <Truck size={32} />
              },
              {
                title: 'Express Delivery',
                desc: 'Guaranteed time-bound delivery for critical components across India\'s industrial hubs.',
                icon: <Zap size={32} />
              },
              {
                title: 'On-Demand Rental',
                desc: 'Access a vast fleet of cranes, excavators, and commercial vehicles on a flexible rental basis.',
                icon: <Clock size={32} />
              }
            ].map((service, i) => (
              <div key={i} className="group p-10 bg-slate-50 rounded-[3rem] hover:bg-slate-900 transition-all duration-500 hover:-translate-y-2">
                <div className="mb-6 inline-block p-5 bg-white rounded-3xl text-amber-600 shadow-sm group-hover:bg-amber-500 group-hover:text-black transition-all">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-white transition-colors">{service.title}</h3>
                <p className="text-slate-600 leading-relaxed group-hover:text-slate-400 transition-colors">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-32 px-6 lg:px-16 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <img src={banner2} className="w-full h-full object-cover" alt="" />
        </div>
        <div className="container mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <span className="text-amber-500 font-black text-xs tracking-widest uppercase">The Tranzo Mission</span>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter leading-none uppercase">
                Driving The Future of <br /> <span className="text-amber-500">Indian Growth.</span>
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                Founded in 2026, TRANZO was born from a vision to revolutionize the chaotic landscape of industrial logistics. We bridge the gap between heavy industry and seamless mobility.
              </p>
              <div className="grid grid-cols-2 gap-8 pt-8">
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white">
                       <Users className="text-amber-500" size={20} />
                       <span className="font-bold uppercase tracking-widest text-sm">Empowerment</span>
                    </div>
                    <p className="text-xs text-slate-500">Supporting thousands of independent driver partners.</p>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-white">
                       <MapPin className="text-amber-500" size={20} />
                       <span className="font-bold uppercase tracking-widest text-sm">Nationwide</span>
                    </div>
                    <p className="text-xs text-slate-500">Connecting industries from Kanyakumari to Kashmir.</p>
                 </div>
              </div>
            </div>
            <div className="relative">
               <div className="aspect-square bg-amber-500 rounded-[4rem] relative overflow-hidden shadow-2xl rotate-3">
                  <img src={banner3} className="w-full h-full object-cover mix-blend-multiply opacity-80" alt="" />
                  <div className="absolute inset-0 flex items-center justify-center">
                     <div className="text-black text-8xl font-black tracking-tighter">EST. 2026</div>
                  </div>
               </div>
               <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-[3rem] shadow-2xl hidden md:block">
                  <div className="text-slate-900 font-black text-4xl leading-none tracking-tighter">100%</div>
                  <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-2">Reliability Guarantee</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="py-32 px-6 lg:px-16 bg-slate-50 relative">
        <div className="container mx-auto">
          <div className="text-center mb-16 space-y-4">
            <span className="text-amber-600 font-black text-xs tracking-widest uppercase">Fleet Intelligence</span>
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight uppercase">
              Heavy mobility for modern infrastructure.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((v, i) => (
              <div
                key={i}
                className="group relative bg-white rounded-[2.5rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 h-[400px]"
              >
                <img
                  src={v.icon}
                  alt={v.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full">
                  <div className="space-y-1">
                    <span className="text-amber-500 text-[10px] font-black tracking-widest uppercase">
                      {v.category}
                    </span>
                    <h3 className="text-white text-2xl font-black uppercase flex items-center justify-between">
                      {v.title}
                      <div className="h-10 w-10 bg-amber-500 rounded-full flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all">
                         <ChevronRight size={20} />
                      </div>
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-20 px-6 lg:px-16 border-t border-white/5">
        <div className="container mx-auto flex flex-col items-center">
            <div onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="cursor-pointer">
              <Logo variant="light" showTagline className="mb-10 scale-110" />
            </div>
            <div className="flex flex-wrap justify-center gap-8 mb-12">
              <button onClick={() => scrollToSection('fleet')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">Fleet</button>
              <button onClick={() => scrollToSection('services')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">Services</button>
              <button onClick={() => scrollToSection('about')} className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">About</button>
              <button className="text-xs font-bold uppercase tracking-widest hover:text-amber-500 transition-colors">Contact</button>
            </div>
            <p className="text-sm text-slate-400 text-center max-w-lg leading-relaxed mb-12">
              TRANZO is India's leading industrial mobility platform, empowering businesses with a reliable, efficient, and scaleable commercial fleet.
            </p>
            <div className="w-full h-[1px] bg-white/5 mb-12"></div>
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-6 text-[9px] text-slate-500 font-bold uppercase tracking-widest">
               <span>© 2026 TRANZO Logistics Infrastructure</span>
               <div className="flex gap-8">
                  <a href="#">Terms</a>
                  <a href="#">Privacy</a>
                  <a href="#">Cookies</a>
               </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
