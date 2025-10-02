
'use client';
import { useEffect, useState } from 'react';
import {
  Facebook,
  Twitter,
  Linkedin,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  Lock,
  Handshake,
  Zap,
  Search as SearchIcon,
  BookUser,
  HeartPulse,
  Bot as BotIcon,
  ChevronDown,
  Building,
  User,
  MoreVertical,
  ChevronRight,
  Mail,
  File,
  MessageSquare,
  X,
  Users,
  MapPin,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogTrigger, DialogClose, DialogOverlay, DialogPortal, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import LoginModal from '@/components/login-modal';
import Autoplay from "embla-carousel-autoplay"
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';


// Helper components for Font Awesome icons
const Icon = ({ faClass }: { faClass: string }) => {
    return <i className={faClass}></i>;
};

const AnimatedArrow = () => (
    <motion.svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
    >
        <motion.path
            d="M9 18l6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-300"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
        />
    </motion.svg>
);


interface CMSData {
  statisticsGroups: any[];
  features: any[];
  testimonials: any[];
  faqs: any[];
  heroContent: any;
}

// Fallback CMS data
const getFallbackCMSData = () => ({
    statisticsGroups: [
        {
            title: 'Overall Performance',
            stats: [
                { id: '1', label: 'Successful Placements', value: 12543, suffix: '+', icon: '<i class="fas fa-graduation-cap text-blue-600"></i>' },
                { id: '2', label: 'Student Satisfaction', value: 94, suffix: '%', icon: '<i class="fas fa-heart text-red-500"></i>' },
                { id: '3', label: 'Compliance Rate', value: 99, suffix: '%', icon: '<i class="fas fa-shield-check text-green-600"></i>' },
            ]
        },
        {
            title: 'Network & Partners',
            stats: [
                { id: '4', label: 'RTO Partners', value: 157, suffix: '+', icon: '<i class="fas fa-university text-purple-600"></i>' },
                { id: '5', label: 'Industry Providers', value: 2891, suffix: '+', icon: '<i class="fas fa-building text-orange-600"></i>' },
                { id: '6', label: 'Placement Success Rate', value: 87, suffix: '%', icon: '<i class="fas fa-chart-line text-teal-600"></i>' },
            ]
        }
    ],
    heroContent: null,
    features: [
        { id: '1', title: 'AI-Powered Matching', description: 'Smart algorithms match students with ideal placements', icon: 'Bot' },
        { id: '2', title: 'Automated Compliance', description: 'Ensure 100% compliance with VET sector requirements', icon: 'ShieldCheck' },
        { id: '3', title: 'Unified Dashboard', description: 'One platform for RTOs, providers, and students', icon: 'LayoutDashboard' },
        { id: '4', title: 'Real-time Monitoring', description: 'Track placement progress and outcomes instantly', icon: 'Activity' },
        { id: '5', title: 'Digital Assessments', description: 'Streamlined assessment and evaluation tools', icon: 'FileCheck' },
        { id: '6', title: 'Secure Communication', description: 'GDPR-compliant messaging and document sharing', icon: 'MessageSquare' }
    ],
    testimonials: [
        { id: '1', quote: 'PlacementGuru revolutionized how we manage student placements.', name: 'Sarah Chen', role: 'VET Coordinator', company: 'Sydney Training Institute', logo: null },
        { id: '2', quote: 'Finding quality placements used to be a nightmare. Now it takes minutes.', name: 'Michael Roberts', role: 'Director', company: 'Skills Australia', logo: null },
        { id: '3', quote: 'The automated compliance features saved us countless headaches.', name: 'Jessica Martinez', role: 'Compliance Manager', company: 'VET Institute', logo: null }
    ],
    faqs: [
        { id: '1', question: 'How does the AI matching system work?', answer: 'Our AI analyzes student profiles, course requirements, and provider criteria to suggest optimal placements.' },
        { id: '2', question: 'Is PlacementGuru compliant with Australian VET standards?', answer: 'Yes, we ensure 100% compliance with all VET sector requirements and regulations.' },
        { id: '3', question: 'What support is available for students during placements?', answer: '24/7 support, regular check-ins, and direct communication channels with supervisors.' },
        { id: '4', question: 'How do providers post placement opportunities?', answer: 'Providers can easily post opportunities through our intuitive dashboard with automated matching.' },
        { id: '5', question: 'What are the costs involved?', answer: 'We offer flexible pricing plans for RTOs and providers. Contact us for a customized quote.' }
    ]
});

export default function Home() {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDistance, setSelectedDistance] = useState('');
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [cmsData, setCmsData] = useState<CMSData>(() => {
      const fallback = getFallbackCMSData();
      return {
        statisticsGroups: fallback.statisticsGroups,
        features: fallback.features,
        testimonials: fallback.testimonials,
        faqs: fallback.faqs,
        heroContent: fallback.heroContent
      };
    });
    const [loading, setLoading] = useState(true);

    // Handler functions
    const handleBookDemo = () => {
        console.log('Book Demo clicked');
        // In production, would open calendar or contact form
        alert('Demo booking would open here. Contact: demo@placementguru.com');
    };

    const handleWatchVideo = () => {
        console.log('Watch Video clicked');
        // In production, would open video modal or redirect to video
        alert('Video player would open here');
    };

    const handleSearch = () => {
        console.log('Search clicked:', { query: searchQuery, distance: selectedDistance });
        // In production, would perform actual search
        alert(`Searching for placements: ${searchQuery} within ${selectedDistance || '10'}km`);
    };

    const handleViewProfile = (name: string) => {
        console.log('View Profile clicked:', name);
        // In production, would navigate to profile page
        alert(`Would navigate to ${name} profile page`);
    };

    const handleViewOpportunities = (name: string) => {
        console.log('View Opportunities clicked:', name);
        // In production, would navigate to opportunities page
        alert(`Would show opportunities at ${name}`);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Newsletter signup:', newsletterEmail);
        if (newsletterEmail) {
            alert(`Thank you for subscribing with ${newsletterEmail}!`);
            setNewsletterEmail('');
        }
    };

    const handleChatSupport = () => {
        console.log('Chat Support clicked');
        // In production, would open chat widget
        alert('Chat support would open here');
    };

    useEffect(() => {
        // Fetch CMS data from API
        const fetchCMSData = async () => {
          try {
            const response = await fetch('/api/cms');
            if (response.ok) {
              const data = await response.json();
              setCmsData({
                statisticsGroups: data.statisticsGroups || getFallbackCMSData().statisticsGroups,
                features: data.features || [],
                testimonials: data.testimonials || [],
                faqs: data.faqs || [],
                heroContent: null
              });
            } else {
              console.error('Failed to fetch CMS data, using fallback');
              setCmsData(getFallbackCMSData());
            }
          } catch (error) {
            console.error('Error fetching CMS data, using fallback:', error);
            setCmsData(getFallbackCMSData());
          } finally {
            setLoading(false);
          }
        };

        fetchCMSData();
    }, []);

    const avatars = [
        { name: 'User 1', src: 'https://i.pravatar.cc/150?img=1' },
        { name: 'User 2', src: 'https://i.pravatar.cc/150?img=2' },
        { name: 'User 3', src: 'https://i.pravatar.cc/150?img=3' },
        { name: 'User 4', src: 'https://i.pravatar.cc/150?img=4' },
        { name: 'User 5', src: 'https://i.pravatar.cc/150?img=5' },
    ];


    // Fallback image function for failed logo loads
    const getCompanyLogo = (name: string, originalUrl?: string) => {
        // Use a consistent placeholder with the company initial
        const initial = name.charAt(0).toUpperCase();
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=48&background=0ea5e9&color=ffffff&rounded=true&bold=true`;
    };

    const rtoPartners = [
      {
        name: 'TAFE NSW',
        logo: getCompanyLogo('TAFE NSW'),
        description: 'Leading provider of vocational education and training in Australia.',
        courses: 150,
        location: 'Sydney, NSW',
        courseType: 'Vocational'
      },
      {
        name: 'Skills Australia',
        logo: getCompanyLogo('Skills Australia'),
        description: 'Specializing in trade and construction courses for the modern workforce.',
        courses: 75,
        location: 'Melbourne, VIC',
        courseType: 'Trade'
      },
      {
        name: 'VET Institute',
        logo: getCompanyLogo('VET Institute'),
        description: 'A wide range of courses in business, technology, and healthcare.',
        courses: 120,
        location: 'Brisbane, QLD',
        courseType: 'General'
      },
       {
        name: 'Training Plus',
        logo: getCompanyLogo('Training Plus'),
        description: 'Focused on upskilling and professional development programs.',
        courses: 50,
        location: 'Perth, WA',
        courseType: 'Professional'
      },
       {
        name: 'General Assembly',
        logo: 'https://logo.clearbit.com/generalassemb.ly',
        description: 'Global tech education company specializing in in-demand skills.',
        courses: 90,
        location: 'Online',
        courseType: 'Tech'
      },
        {
        name: 'RMIT University',
        logo: 'https://logo.clearbit.com/rmit.edu.au',
        description: 'A global university of technology, design and enterprise.',
        courses: 200,
        location: 'Melbourne, VIC',
        courseType: 'University'
      },
       {
        name: 'Box Hill Institute',
        logo: 'https://logo.clearbit.com/boxhill.edu.au',
        description: 'A leading Victorian TAFE institute providing a wide range of courses.',
        courses: 180,
        location: 'Melbourne, VIC',
        courseType: 'Vocational'
      },
      {
        name: 'Chisholm Institute',
        logo: 'https://logo.clearbit.com/chisholm.edu.au',
        description: 'A large TAFE in Melbourne\'s south-east, offering diverse programs.',
        courses: 160,
        location: 'Melbourne, VIC',
        courseType: 'TAFE'
      },
    ];

    const placementPartners = [
      {
        name: "St. Vincent's Hospital",
        logo: 'https://logo.clearbit.com/svha.org.au',
        description: 'A leading healthcare provider offering diverse clinical placements.',
        openings: 25,
        industry: 'Healthcare',
        location: 'Sydney, NSW',
        brandColor: '#3b82f6', // Blue
        icon: <HeartPulse className="text-blue-500" />,
      },
      {
        name: 'Lendlease',
        logo: 'https://logo.clearbit.com/lendlease.com',
        description: 'International construction and real estate company.',
        openings: 15,
        industry: 'Construction',
        location: 'Melbourne, VIC',
        brandColor: '#f97316', // Orange
        icon: <Building className="text-orange-500" />,
      },
      {
        name: 'Anglicare',
        logo: 'https://logo.clearbit.com/anglicare.org.au',
        description: 'Providing aged care and community services across Australia.',
        openings: 40,
        industry: 'Aged Care',
        location: 'Brisbane, QLD',
        brandColor: '#14b8a6', // Teal
        icon: <Users className="text-teal-500" />,
      },
      {
        name: 'Canva',
        logo: 'https://logo.clearbit.com/canva.com',
        description: 'A global leader in visual communication and design software.',
        openings: 10,
        industry: 'Technology',
        location: 'Perth, WA',
        brandColor: '#8b5cf6', // Violet
        icon: <Zap className="text-violet-500" />,
      },
        {
        name: 'KPMG Australia',
        logo: getCompanyLogo('KPMG Australia'),
        description: 'Professional services company offering business and finance placements.',
        openings: 20,
        industry: 'Finance',
        location: 'Sydney, NSW',
        brandColor: '#059669', // Emerald
        icon: <Icon faClass="fas fa-chart-line text-emerald-500" />,
      },
      {
        name: 'Atlassian',
        logo: 'https://logo.clearbit.com/atlassian.com',
        description: 'Leading provider of software development and collaboration tools.',
        openings: 12,
        industry: 'Technology',
        location: 'Remote',
        brandColor: '#2563eb', // Blue
        icon: <Zap className="text-blue-500" />,
      },
        {
        name: 'Ramsay Health Care',
        logo: 'https://logo.clearbit.com/ramsayhealth.com',
        description: 'One of the largest private hospital operators in the world.',
        openings: 30,
        industry: 'Healthcare',
        location: 'Melbourne, VIC',
        brandColor: '#dc2626', // Red
        icon: <HeartPulse className="text-red-500" />,
      },
        {
        name: 'Accenture',
        logo: 'https://logo.clearbit.com/accenture.com',
        description: 'A global professional services company with leading capabilities in digital, cloud and security.',
        openings: 18,
        industry: 'Consulting',
        location: 'Sydney, NSW',
        brandColor: '#c026d3', // Fuchsia
        icon: <Handshake className="text-fuchsia-500" />,
      }
    ];

    // Use testimonials from CMS data
    const testimonials = cmsData.testimonials.length > 0 ? cmsData.testimonials : [
        {
            quote: "PlacementGuru revolutionized how we manage student placements. The time savings are incredible, and our compliance has never been better.",
            name: "Jane Smith",
            role: "VET Coordinator",
            company: "TAFE NSW",
            logo: "https://logo.clearbit.com/tafensw.edu.au"
        },
        {
            quote: "Finding quality placements used to be a nightmare. Now, we connect with verified providers in minutes. A total game-changer for our RTO.",
            name: "David Lee",
            role: "Director",
            company: "Skills Australia",
            logo: "https://logo.clearbit.com/skills.sa.gov.au"
        },
        {
            quote: "The platform's automated tracking and reporting have saved us from countless compliance headaches. I can't imagine going back.",
            name: "Maria Garcia",
            role: "Compliance Manager",
            company: "VET Institute",
            logo: "https://logo.clearbit.com/vetinst.com.au"
        }
    ];

    const integrations = [
        { name: "Google", logo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", caption: "Email & Calendar" },
        { name: "Slack", logo: "https://logo.clearbit.com/slack.com", caption: "Messaging" },
        { name: "Microsoft", logo: "https://logo.clearbit.com/office.com", caption: "Docs & Email" },
        { name: "Zapier", logo: "https://logo.clearbit.com/zapier.com", caption: "Automation" },
        { name: "Moodle", logo: "https://logo.clearbit.com/moodle.com", caption: "LMS" }
    ];

    return (
        <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <div className={`bg-slate-50 text-slate-800 transition-all ${isLoginOpen ? 'filter blur-sm' : ''}`}>
                <header id="header" className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
                    <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                                <GraduationCap className="text-white text-sm" />
                            </div>
                            <span className="ml-3 text-gray-900 text-lg font-bold">PlacementGuru</span>
                        </div>
                        <nav className="hidden md:flex space-x-8">
                            <span className="text-gray-600 hover:text-primary font-medium cursor-pointer transition-colors text-sm">Features</span>
                            <span className="text-gray-600 hover:text-primary font-medium cursor-pointer transition-colors text-sm">Pricing</span>
                            <span className="text-gray-600 hover:text-primary font-medium cursor-pointer transition-colors text-sm">Resources</span>
                            <span className="text-gray-600 hover:text-primary font-medium cursor-pointer transition-colors text-sm">About</span>
                        </nav>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <DialogTrigger asChild>
                                <Button variant="ghost" className="hidden sm:inline-flex">Sign In</Button>
                            </DialogTrigger>
                            <Button onClick={handleBookDemo} className="bg-primary hover:bg-primary/90 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all text-sm whitespace-nowrap shadow-sm hover:shadow-md">Book Demo</Button>
                        </div>
                    </div>
                </header>

                <main>
                    <section id="hero" className="py-16 sm:py-24 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden animated-gradient">
                        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-20 floating-animation"></div>
                        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-200 rounded-full opacity-20 floating-animation"></div>
                        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-teal-200 rounded-full opacity-20 floating-animation"></div>

                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-8">
                                <div className="flex justify-center items-center -space-x-2 mb-4">
                                    {avatars.map((avatar, index) => (
                                        <motion.div
                                            key={avatar.name}
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{
                                                delay: index * 0.1,
                                                type: 'spring',
                                                stiffness: 260,
                                                damping: 20,
                                            }}
                                        >
                                            <Avatar className={`h-12 w-12 border-2 border-white shadow-md ${index === 2 ? 'h-16 w-16 z-10' : ''}`}>
                                                <AvatarImage src={avatar.src} alt={avatar.name} />
                                                <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-sm font-medium text-gray-700">Join over <span className="font-bold text-primary">1,200+ satisfied students</span> and RTOs</p>
                            </div>
                            <div className="text-center mb-8">
                                <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm mb-4">
                                    <div className="flex items-center space-x-1">
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                        <i className="fas fa-star text-yellow-400 text-sm"></i>
                                    </div>
                                    <span className="ml-2 text-sm font-medium text-gray-900">4.9/5 from 120+ RTOs</span>
                                </div>
                            </div>
                            
                            <div className="text-center mb-16">
                                <motion.h1 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight md:max-w-4xl mx-auto">
                                    <span className="md:block">The Only Platform That Guarantees</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-blue-600">100% Compliant</span> Student Placements
                                </motion.h1>
                                <motion.p 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                                    Save 60% admin time. Cut compliance risk by 98%. Connect with 500+ verified providers instantly.
                                </motion.p>

                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.4 }}
                                    className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                    <Button onClick={handleBookDemo} size="lg" className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
                                        Book a Demo
                                    </Button>
                                    <Button onClick={handleWatchVideo} size="lg" variant="outline" className="w-full sm:w-auto border-2 border-gray-300 hover:border-primary text-gray-600 hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-all bg-white/50 hover:bg-white">
                                        <i className="fas fa-play mr-2"></i>
                                        Watch 2-Minute Explainer
                                    </Button>
                                </motion.div>
                            </div>

                            <div className="flex justify-center items-center space-x-2 sm:space-x-4 text-gray-700 mt-12">
                                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
                                        <GraduationCap className="text-2xl text-teal-600"/>
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">Student</span>
                                </motion.div>
                                <AnimatedArrow />
                                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
                                        <ShieldCheck className="text-2xl text-blue-600"/>
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">RTO</span>
                                </motion.div>
                                <AnimatedArrow />
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 }} className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-md mb-2">
                                        <Handshake className="text-2xl text-purple-600"/>
                                    </div>
                                    <span className="font-semibold text-sm sm:text-base">Provider</span>
                                </motion.div>
                            </div>
                        </div>
                    </section>
                    
                    <section id="how-it-works" className="py-16 sm:py-20 bg-white">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12 sm:mb-16">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">How It Works for You</h2>
                                <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                                    A tailored experience, no matter your role. Select your role to see how PlacementGuru solves your biggest challenges.
                                </p>
                            </div>

                            <Tabs defaultValue="rto" className="max-w-5xl mx-auto">
                                <TabsList className="grid w-full grid-cols-3 h-auto p-1.5 bg-gray-100 rounded-2xl">
                                    <TabsTrigger value="rto" className="py-3 text-base font-semibold rounded-lg flex items-center gap-2">
                                        <ShieldCheck /> For RTOs
                                    </TabsTrigger>
                                    <TabsTrigger value="provider" className="py-3 text-base font-semibold rounded-lg flex items-center gap-2">
                                        <Handshake /> For Providers
                                    </TabsTrigger>
                                    <TabsTrigger value="student" className="py-3 text-base font-semibold rounded-lg flex items-center gap-2">
                                        <GraduationCap /> For Students
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="rto" className="mt-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                        <Card className="overflow-hidden">
                                            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                                <div className="p-10">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Automate Compliance & Track Students</h3>
                                                    <p className="text-gray-600 mb-6">Effortlessly match students with qualified providers, track placement hours with automated compliance reporting, and get AI-powered risk alerts for at-risk placements. Manage everything from one central dashboard.</p>
                                                    <ul className="space-y-3 text-gray-700">
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>AI-Powered Placement Matching</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Automated ASQA Compliance</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Real-Time Student Progress Tracking</li>
                                                    </ul>
                                                </div>
                                                <div className="bg-slate-100 p-8 h-full hidden md:flex items-center justify-center">
                                                    <Image src="https://picsum.photos/seed/rto-dashboard/600/400" alt="RTO Dashboard Preview" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="dashboard preview" />
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="provider" className="mt-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                        <Card className="overflow-hidden">
                                            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                                <div className="p-10">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Fill Placements Faster & Manage Digitally</h3>
                                                    <p className="text-gray-600 mb-6">Receive pre-screened student applications that match your needs. Manage all documentation, communication, and student evaluations in one place, reducing administrative overhead.</p>
                                                      <ul className="space-y-3 text-gray-700">
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Access to a Large Student Pool</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Streamlined Application Management</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Digital Document & Evaluation Tools</li>
                                                    </ul>
                                                </div>
                                                 <div className="bg-slate-100 p-8 h-full hidden md:flex items-center justify-center">
                                                    <Image src="https://picsum.photos/seed/provider-dashboard/600/400" alt="Provider Dashboard Preview" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="application management" />
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                                <TabsContent value="student" className="mt-8">
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                                        <Card className="overflow-hidden">
                                            <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                                                <div className="p-10">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Find Verified Placements & Grow Your Career</h3>
                                                    <p className="text-gray-600 mb-6">Discover placement opportunities faster with our AI-powered matching. Track your progress, manage your documents, and get career advice from our AI assistant, all in one secure platform.</p>
                                                    <ul className="space-y-3 text-gray-700">
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Personalized Opportunity Matching</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>Easy Document & Hours Logging</li>
                                                        <li className="flex items-center gap-2"><CheckCircle className="text-green-500 w-5 h-5"/>AI Career & Interview Coach</li>
                                                    </ul>
                                                </div>
                                                 <div className="bg-slate-100 p-8 h-full hidden md:flex items-center justify-center">
                                                    <Image src="https://picsum.photos/seed/student-dashboard/600/400" alt="Student Dashboard Preview" width={600} height={400} className="rounded-lg shadow-xl" data-ai-hint="student progress" />
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </section>
                    
                    <section id="metrics" className="py-12 bg-white border-t border-gray-100">
                        <div className="container mx-auto px-4 sm:px-6">
                            {loading ? (
                                <div className="text-center">Loading statistics...</div>
                            ) : (
                                <div className="space-y-12 max-w-6xl mx-auto">
                                    {(cmsData.statisticsGroups || []).map((group: any, groupIndex: number) => (
                                        <div key={groupIndex} className="text-center">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-8">{group.title}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                {(group.stats || []).map((stat: any) => (
                                                    <div key={stat.id} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100 transition-colors">
                                                        <div className="mb-4 mx-auto w-16 h-16 flex items-center justify-center bg-white rounded-xl shadow-sm">
                                                            <div dangerouslySetInnerHTML={{ __html: stat.icon }} />
                                                        </div>
                                                        <div className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
                                                            <CountUp end={stat.value} duration={2.5} enableScrollSpy separator=","/>
                                                            {stat.suffix || ''}
                                                        </div>
                                                        <div className="text-base text-gray-600 font-medium">{stat.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section id="features-overview" className="py-16 sm:py-20 bg-white">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12 sm:mb-16">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Complete Placement Management Suite</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Everything you need to streamline placement workflows and ensure compliance
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
                                <div className="space-y-8">
                                    <div className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                <i className="fas fa-users-cog text-teal-600"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Smart Placement Matching</h3>
                                                <p className="text-gray-600 text-sm">AI-powered algorithm connects students with the most suitable providers based on skills, location, and availability.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                <i className="fas fa-clock text-blue-600"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Compliance Tracking</h3>
                                                <p className="text-gray-600 text-sm">Automated tracking of placement hours, certifications, and documentation to meet ASQA standards effortlessly.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all">
                                        <div className="flex items-center mb-4">
                                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                                                <i className="fas fa-comments text-green-600"></i>
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-900">Unified Communication</h3>
                                                <p className="text-gray-600 text-sm">A secure, centralized hub for messaging between students, RTOs, and providers, with document sharing and progress updates.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative p-8 bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">
                                    <div className="absolute inset-0 bg-grid-slate-700/40 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
                                    <div className="relative p-4 bg-slate-900/70 rounded-2xl backdrop-blur-sm border border-slate-700">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm font-semibold text-slate-300">Compliance Dashboard</span>
                                            <span className="text-xs text-green-400 font-mono animate-pulse">● Live</span>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <p className="text-slate-300">Provider Verifications</p>
                                                <p className="font-mono text-slate-200">98%</p>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                <motion.div 
                                                    className="bg-green-500 h-2.5 rounded-full" 
                                                    initial={{ width: '0%' }}
                                                    whileInView={{ width: '98%' }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    viewport={{ once: true }}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-slate-300">Student Clearances</p>
                                                <p className="font-mono text-slate-200">85%</p>
                                            </div>
                                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                                <motion.div 
                                                    className="bg-yellow-500 h-2.5 rounded-full"
                                                    initial={{ width: '0%' }}
                                                    whileInView={{ width: '85%' }}
                                                    transition={{ duration: 1, delay: 0.4 }}
                                                    viewport={{ once: true }}
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-6 space-y-3">
                                            <div className="flex items-center p-3 bg-slate-800/50 rounded-lg">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.6 }}
                                                    viewport={{ once: true }}
                                                >
                                                    <MessageSquare className="text-blue-400 mr-3"/>
                                                </motion.div>
                                                <p className="text-sm text-slate-300">New message from <span className="font-semibold text-white">HealthBridge</span></p>
                                            </div>
                                            <div className="flex items-center p-3 bg-slate-800/50 rounded-lg">
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.5, delay: 0.8 }}
                                                    viewport={{ once: true }}
                                                >
                                                    <File className="text-green-400 mr-3"/>
                                                </motion.div>
                                                <p className="text-sm text-slate-300"><span className="font-semibold text-white">Sarah J.</span> submitted her Police Check.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>


                    <section id="rto-listing" className="py-16 sm:py-20 bg-gray-50">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Find Your Perfect RTO</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Connecting students with top-tier Registered Training Organisations across Australia.
                                </p>
                            </div>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {rtoPartners.map((rto, index) => (
                                    <Card key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden">
                                        <Badge className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-none rounded-bl-lg flex items-center border-green-200"><CheckCircle className="mr-1.5 h-3 w-3"/>Verified</Badge>
                                        <div className="flex items-start justify-between">
                                            {rto.logo ? (
                                                <Image src={rto.logo} alt={`${rto.name} Logo`} className="rounded-lg h-12 w-12 object-contain" width={48} height={48} onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                                            ) : (
                                                <div className="rounded-lg h-12 w-12 bg-gray-200 flex items-center justify-center">
                                                    <GraduationCap className="h-6 w-6 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex-grow">
                                            <h3 className="text-lg font-bold text-gray-900">{rto.name}</h3>
                                             <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <Badge variant="secondary" className="flex items-center"><i className="fas fa-map-marker-alt mr-1.5"></i>{rto.location}</Badge>
                                                <Badge variant="secondary" className="flex items-center"><i className="fas fa-book-open mr-1.5"></i>{rto.courseType}</Badge>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleViewProfile(rto.name)} className="mt-6 w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">View Profile</Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    <section id="provider-listing" className="py-16 sm:py-20 bg-gray-50">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Explore Placement Opportunities</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                    Access a curated network of top-tier companies offering quality student placements.
                                </p>
                            </div>
                            <Card className="mb-8">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="provider-search">Postcode or Suburb</Label>
                                            <Input 
                                                id="provider-search" 
                                                placeholder="e.g., 2000 or Sydney" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="provider-distance">Distance</Label>
                                            <Select value={selectedDistance} onValueChange={setSelectedDistance}>
                                                <SelectTrigger id="provider-distance">
                                                    <SelectValue placeholder="Within 10km" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="5">Within 5km</SelectItem>
                                                    <SelectItem value="10">Within 10km</SelectItem>
                                                    <SelectItem value="25">Within 25km</SelectItem>
                                                    <SelectItem value="50">Within 50km</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleSearch} className="w-full h-10">Search</Button>
                                    </div>
                                </CardContent>
                            </Card>
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {placementPartners.map((partner, index) => (
                                    <Card key={index} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden">
                                         <Badge className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-2.5 py-1 rounded-none rounded-bl-lg flex items-center border-green-200"><CheckCircle className="mr-1.5 h-3 w-3"/>Verified</Badge>
                                        <div className="flex items-start justify-between">
                                            {partner.logo ? (
                                                <Image 
                                                    src={partner.logo} 
                                                    alt={`${partner.name} Logo`} 
                                                    className="rounded-lg h-12 w-12 object-contain" 
                                                    width={48} 
                                                    height={48} 
                                                    onError={(e) => { 
                                                        e.currentTarget.src = getCompanyLogo(partner.name);
                                                    }}
                                                />
                                            ) : (
                                                <div className="rounded-lg h-12 w-12 bg-gray-200 flex items-center justify-center">
                                                    <Building className="h-6 w-6 text-gray-500" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="mt-4 flex-grow">
                                            <h3 className="text-lg font-bold text-gray-900">{partner.name}</h3>
                                            <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                                <Badge variant="secondary" className="flex items-center"><MapPin className="mr-1.5 h-3 w-3"/>{partner.location}</Badge>
                                                <Badge variant="secondary" className="flex items-center"><Briefcase className="mr-1.5 h-3 w-3"/>{partner.industry}</Badge>
                                            </div>
                                        </div>
                                        <Button onClick={() => handleViewOpportunities(partner.name)} className="mt-6 w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-primary/90 transition-colors">View Opportunities</Button>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </section>
                    
                    <section id="testimonials" className="py-16 sm:py-20 bg-gray-50">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Trusted by Leading RTOs</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">See what our partners have to say about PlacementGuru.</p>
                            </div>

                            <Carousel opts={{ loop: true, align: 'start' }} plugins={[Autoplay({ delay: 5000 })]} className="w-full">
                                <CarouselContent className="-ml-4">
                                    {testimonials.map((testimonial, index) => (
                                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 pl-4">
                                            <div className="p-1 h-full">
                                                <Card className="flex flex-col h-full">
                                                    <CardContent className="p-6 flex-grow">
                                                        {testimonial.logo ? (
                                                            <Image src={testimonial.logo} alt={`${testimonial.company} logo`} width={120} height={40} className="h-8 mb-4 object-contain" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                                                        ) : (
                                                            <div className="h-8 mb-4 w-32 bg-gray-200 rounded flex items-center justify-center">
                                                                <span className="text-xs text-gray-500 font-medium">{testimonial.company}</span>
                                                            </div>
                                                        )}
                                                        <p className="text-gray-600 italic">"{testimonial.quote}"</p>
                                                    </CardContent>
                                                    <CardFooter className="p-6 bg-slate-100 flex items-center gap-4">
                                                        <Avatar className="h-12 w-12">
                                                            <AvatarImage src={`https://i.pravatar.cc/150?img=${10 + index}`} />
                                                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <p className="font-semibold text-gray-900">{testimonial.name}</p>
                                                            <p className="text-sm text-gray-500">{testimonial.role}, {testimonial.company}</p>
                                                        </div>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious />
                                <CarouselNext />
                            </Carousel>
                        </div>
                    </section>
                    
                    <section id="integrations" className="py-16 sm:py-20 bg-white">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Integrates With Your Favorite Tools</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto">Connect PlacementGuru with the software you already use.</p>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
                                {integrations.map((tool) => (
                                <div key={tool.name} className="text-center space-y-2">
                                    <div className={`w-20 h-20 bg-white rounded-2xl shadow-md border flex items-center justify-center`}>
                                    {tool.logo ? (
                                        <Image src={tool.logo} alt={tool.name} width={48} height={48} className="object-contain h-10" onError={(e) => { e.currentTarget.style.display = 'none'; }}/>
                                    ) : (
                                        <div className="h-10 w-12 bg-gray-200 rounded flex items-center justify-center">
                                            <span className="text-xs text-gray-500 font-bold">{tool.name.charAt(0)}</span>
                                        </div>
                                    )}
                                    </div>
                                    <p className="font-semibold text-sm text-muted-foreground">{tool.caption}</p>
                                </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <footer id="footer" className="bg-gray-900 text-white pt-16 sm:pt-20">
                        <div className="container mx-auto px-4 sm:px-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                                <div className="lg:col-span-2">
                                    <div className="flex items-center mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-blue-600 flex items-center justify-center shadow-lg">
                                            <GraduationCap className="text-white text-xl" />
                                        </div>
                                        <span className="ml-3 text-white text-2xl font-bold">PlacementGuru</span>
                                    </div>
                                    <p className="text-gray-400 mb-6 leading-relaxed">Transforming RTO operations with intelligent automation and seamless connectivity.</p>
                                    <div className="flex space-x-4">
                                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Linkedin className="text-lg" /></a>
                                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Twitter className="text-lg" /></a>
                                        <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary transition-colors cursor-pointer"><Facebook className="text-lg" /></a>
                                    </div>
                                </div>
                                <div className="col-span-1">
                                    <h4 className="font-semibold mb-6 text-lg text-gray-200">Product</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Features</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Pricing</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Demo</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Integrations</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">API</a></li>
                                    </ul>
                                </div>
                                <div className="col-span-1">
                                    <h4 className="font-semibold mb-6 text-lg text-gray-200">Resources</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Blog</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Help Center</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Webinars</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Case Studies</a></li>
                                    </ul>
                                </div>
                                <div className="col-span-1">
                                    <h4 className="font-semibold mb-6 text-lg text-gray-200">Company</h4>
                                    <ul className="space-y-3">
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">About</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Careers</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Contact</a></li>
                                        <li><a href="#" className="text-gray-400 hover:text-white cursor-pointer transition-colors">Security</a></li>
                                    </ul>
                                </div>
                            </div>

                            <div className="bg-gray-800 rounded-2xl p-8 mb-8 bg-gradient-to-r from-gray-800/80 to-primary/20">
                                <div className="text-center">
                                    <h4 className="text-2xl font-bold mb-2 text-white">Stay Compliant. Stay Ahead.</h4>
                                    <p className="text-gray-400 mb-6">Weekly insights on RTO compliance & placements.</p>
                                    <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row max-w-md mx-auto">
                                        <Input 
                                            type="email" 
                                            placeholder="Enter your email" 
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            required
                                            className="w-full flex-1 px-4 py-3 bg-gray-700 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none text-white placeholder-gray-400 border-gray-600 focus:ring-primary"
                                        />
                                        <Button type="submit" className="w-full sm:w-auto bg-gradient-to-r from-primary to-blue-600 px-6 py-3 rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none font-semibold hover:shadow-lg transition-all">
                                            Subscribe
                                        </Button>
                                    </form>
                                    <p className="text-xs text-gray-500 mt-4">We respect your inbox. Unsubscribe anytime.</p>
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 my-8">
                                <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400"/>
                                <span className="text-sm text-gray-400 font-medium">ASQA Compliant</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                <Icon faClass="fab fa-iso text-gray-400 text-lg" />
                                <span className="text-sm text-gray-400 font-medium">ISO Certified</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                <Lock className="w-5 h-5 text-gray-400"/>
                                <span className="text-sm text-gray-400 font-medium">GDPR Ready</span>
                                </div>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 py-6">
                            <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
                                <p>&copy; {new Date().getFullYear()} PlacementGuru. All rights reserved.</p>
                                <p className="my-2 md:my-0">Built with ❤️ in Australia.</p>
                                <div className="flex items-center space-x-2">
                                <span>Language:</span>
                                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">EN | AU</Button>
                                </div>
                            </div>
                        </div>
                    </footer>
                </main>

                <div className="fixed bottom-6 right-6 z-50">
                    <button onClick={handleChatSupport} className="bg-primary hover:bg-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110">
                        <i className="fas fa-comments text-2xl"></i>
                    </button>
                </div>
            </div>

            <DialogContent className="p-0 max-w-md bg-card border-0 shadow-none">
                 <DialogHeader className="sr-only">
                    <DialogTitle>Login</DialogTitle>
                </DialogHeader>
                <LoginModal onClose={() => setIsLoginOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}

