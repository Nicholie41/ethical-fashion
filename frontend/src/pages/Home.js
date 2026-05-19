// Import React hooks for state management and side effects
import React, { useEffect, useState } from 'react';

// Feature highlights for the ethical fashion platform
const features = [
  { icon: '🌱', title: 'Eco-Friendly', desc: 'Only sustainable materials' },
  { icon: '🤝', title: 'Fair Labor', desc: 'Certified fair labor practices' },
  { icon: '🔎', title: 'Transparency', desc: 'Track every product’s journey' },
  { icon: '💚', title: 'Community', desc: 'Support ethical brands worldwide' },
];

// Platform statistics to build trust and credibility
const stats = [
  { value: '100+', label: 'Ethical Brands' },
  { value: '10,000+', label: 'Products' },
  { value: '50+', label: 'Countries' },
];

// Customer testimonials for social proof and credibility
const carouselItems = [
  {
    quote: "I love knowing exactly where my clothes come from. Ethical Fashion makes it easy!",
    author: "Jane D.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    quote: "Beautiful, sustainable, and fair – I’ll never shop fast fashion again.",
    author: "Amina G.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  },
  {
    quote: "Great selection and I feel good about every purchase.",
    author: "Sophie R.",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg"
  }
];

// Video gallery for "Watch Our Story" section - educational content
const videoLinks = [
  {
    url: "https://www.youtube.com/embed/IfWYDcVfBVo",
    title: "Ethical Fashion Video"
  },
  {
    url: "https://www.youtube.com/embed/7uzyhnkt9T0",
    title: "Ethical Fashion Inspiration 1"
  },
  {
    url: "https://www.youtube.com/embed/Q5xZ2j3Zk5k",
    title: "Ethical Fashion Inspiration 2"
  },
  {
    url: "https://www.youtube.com/embed/wb4mtzGGSEM",
    title: "Ethical Fashion Inspiration 3"
  }
];

// Custom hook for fade-in animations with configurable delay and duration
const useFadeIn = (delay = 0, duration = 500) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return {
    style: {
      opacity: show ? 1 : 0,
      transform: show ? 'none' : 'translateY(30px)',
      transition: `all ${duration}ms cubic-bezier(.4,0,.2,1)`
    }
  };
};

// Educational eco facts to raise awareness about sustainable fashion
const ecoFacts = [
  "Did you know? Organic cotton uses 91% less water than regular cotton.",
  "Fashion is the second most polluting industry in the world.",
  "Buying one t-shirt made from recycled materials saves 2,700 liters of water.",
  "Ethical brands ensure fair wages and safe working conditions.",
  "Sustainable fashion reduces carbon footprint and waste.",
];

// Main Home component with user prop for personalized experience
const Home = ({ user }) => {
  // State management for various UI interactions and user engagement features
  const [current, setCurrent] = useState(0);                    // Carousel current item
  const [showModal, setShowModal] = useState(false);            // Modal visibility
  const [videoIndex, setVideoIndex] = useState(0);             // Current video selection
  const [showExitPopup, setShowExitPopup] = useState(false);   // Exit intent popup
  const [showQuiz, setShowQuiz] = useState(false);             // Quiz modal visibility
  const [quizStep, setQuizStep] = useState(0);                 // Current quiz step
  const [quizAnswers, setQuizAnswers] = useState({});          // User quiz responses
  const [showSmartNotification, setShowSmartNotification] = useState(false); // Smart notifications
  const [notificationType, setNotificationType] = useState(''); // Notification type

  // Auto-rotate carousel every 4.5 seconds for dynamic content
  useEffect(() => {
    const interval = setInterval(() => setCurrent(c => (c + 1) % carouselItems.length), 4500);
    return () => clearInterval(interval);
  }, []);

  // Show engagement quiz after 15 seconds for non-logged users (reduced from multiple popups)
  useEffect(() => {
    if (user) return; // Skip for logged-in users
    
    const timer = setTimeout(() => {
      setShowQuiz(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [user]);

  // Single smart notification after 8 seconds
  useEffect(() => {
    if (user) return;
    
    const timer = setTimeout(() => {
      setNotificationType('engagement');
      setShowSmartNotification(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [user]);

  // Exit intent detection
  useEffect(() => {
    if (user) return; // Don't show for logged users

    const handleMouseLeave = (e) => {
      if (e.clientY <= 0) { // Mouse leaves from top of window
        setShowExitPopup(true);
      }
    };

    const handleBeforeUnload = () => {
      if (!user) {
        setShowExitPopup(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user]);

  const heroAnim = useFadeIn(100, 600);
  const featureAnims = [
    useFadeIn(250, 700),
    useFadeIn(400, 700),
    useFadeIn(550, 700),
    useFadeIn(700, 700)
  ];
  const testimonialAnim = useFadeIn(900, 700);
  const statsAnim = useFadeIn(1100, 700);

  // Pick a random eco fact on mount
  const [ecoFact, setEcoFact] = useState(ecoFacts[0]);
  useEffect(() => {
    setEcoFact(ecoFacts[Math.floor(Math.random() * ecoFacts.length)]);
  }, []);

  // Ripple animation for Explore Products button
  const [ripple, setRipple] = useState(false);
  const handleRipple = (e) => {
    setRipple(true);
    setTimeout(() => setRipple(false), 400);
  };

  // Benefits for registered users
  const memberBenefits = [
    { icon: '🎁', title: 'Exclusive Deals', desc: 'Get 15% off your first order' },
    { icon: '📱', title: 'Personalized Feed', desc: 'Discover products tailored to you' },
    { icon: '💬', title: 'Community Access', desc: 'Join our ethical fashion community' },
    { icon: '📊', title: 'Track Impact', desc: 'See your environmental footprint' },
    { icon: '🔔', title: 'Early Access', desc: 'Be first to new sustainable products' },
    { icon: '💎', title: 'VIP Perks', desc: 'Special rewards for loyal members' }
  ];

  // Quiz questions for personalization
  const quizQuestions = [
    {
      question: "What's your primary fashion interest?",
      options: [
        { text: "Casual & Comfortable", icon: "👕" },
        { text: "Professional & Elegant", icon: "👔" },
        { text: "Trendy & Fashion-forward", icon: "🕶️" },
        { text: "Minimalist & Sustainable", icon: "🌱" }
      ]
    },
    {
      question: "How important is sustainability to you?",
      options: [
        { text: "Very Important", icon: "🌍" },
        { text: "Somewhat Important", icon: "♻️" },
        { text: "Nice to Have", icon: "✨" },
        { text: "Not a Priority", icon: "🤷" }
      ]
    },
    {
      question: "What's your typical budget range?",
      options: [
        { text: "Budget-friendly", icon: "💰" },
        { text: "Mid-range", icon: "💳" },
        { text: "Premium", icon: "💎" },
        { text: "Luxury", icon: "👑" }
      ]
    }
  ];

  const handleQuizAnswer = (answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [quizStep]: answer
    }));
    
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Quiz completed, show results and signup prompt
      setShowQuiz(false);
      // Could redirect to signup with personalized recommendations
    }
  };

  const getPersonalizedRecommendations = () => {
    const answers = Object.values(quizAnswers);
    if (answers.length === 0) return "sustainable fashion";
    
    const interests = answers.map(answer => answer.text.toLowerCase());
    if (interests.includes("sustainable") || interests.includes("minimalist")) {
      return "eco-friendly essentials";
    } else if (interests.includes("professional") || interests.includes("elegant")) {
      return "ethical workwear";
    } else if (interests.includes("trendy") || interests.includes("fashion-forward")) {
      return "sustainable streetwear";
    } else {
      return "comfortable ethical basics";
    }
  };

  // Gamification data
  const availableBadges = [
    { id: 'first-purchase', name: 'First Purchase', icon: '🛍️', desc: 'Complete your first order', points: 100 },
    { id: 'eco-warrior', name: 'Eco Warrior', icon: '🌱', desc: 'Buy 5 sustainable products', points: 250 },
    { id: 'streak-master', name: 'Streak Master', icon: '🔥', desc: 'Visit for 7 days in a row', points: 500 },
    { id: 'reviewer', name: 'Top Reviewer', icon: '⭐', desc: 'Write 10 product reviews', points: 300 },
    { id: 'community', name: 'Community Hero', icon: '💬', desc: 'Help 5 other members', points: 400 },
    { id: 'vip', name: 'VIP Member', icon: '👑', desc: 'Reach 1000 points', points: 1000 }
  ];

  const achievements = [
    { id: 'welcome', name: 'Welcome Bonus', icon: '🎉', desc: 'Join our community', points: 50, unlocked: true },
    { id: 'explorer', name: 'Explorer', icon: '🔍', desc: 'Browse 20 products', points: 25, unlocked: false },
    { id: 'collector', name: 'Collector', icon: '📦', desc: 'Add 10 items to wishlist', points: 75, unlocked: false },
    { id: 'savvy', name: 'Savvy Shopper', icon: '💰', desc: 'Save $50 on purchases', points: 200, unlocked: false }
  ];

  const leaderboardData = [
    { name: 'Sarah M.', points: 2840, badge: '👑', level: 'VIP' },
    { name: 'Alex K.', points: 2150, badge: '🔥', level: 'Gold' },
    { name: 'Emma R.', points: 1890, badge: '⭐', level: 'Silver' },
    { name: 'You', points: 0, badge: '🌱', level: 'New' }
  ];

  // Social proof data
  const userReviews = [
    {
      id: 1,
      user: 'Maria S.',
      avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
      rating: 5,
      review: 'Amazing quality and I love knowing my clothes are ethically made!',
      product: 'Organic Cotton T-Shirt',
      date: '2 days ago',
      verified: true,
      helpful: 24
    },
    {
      id: 2,
      user: 'David L.',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      rating: 5,
      review: 'Perfect fit and the sustainability score helped me make the right choice.',
      product: 'Bamboo Jeans',
      date: '1 week ago',
      verified: true,
      helpful: 18
    },
    {
      id: 3,
      user: 'Sophie R.',
      avatar: 'https://randomuser.me/api/portraits/women/67.jpg',
      rating: 5,
      review: 'Fast shipping and the community features are so helpful!',
      product: 'Recycled Denim Jacket',
      date: '3 days ago',
      verified: true,
      helpful: 31
    }
  ];

  const communityStats = {
    totalMembers: 25430,
    activeToday: 1247,
    reviewsPosted: 15420,
    productsSaved: 89250,
    carbonSaved: 125.6 // tons
  };

  const socialProof = [
    { icon: '👥', value: '25K+', label: 'Active Members' },
    { icon: '⭐', value: '4.9/5', label: 'Average Rating' },
    { icon: '🌍', value: '125.6t', label: 'CO2 Saved' },
    { icon: '💬', value: '15K+', label: 'Reviews' }
  ];

  // Advanced personalization data
  const personalizedRecommendations = [
    {
      id: 1,
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=300&q=80',
      sustainabilityScore: 9,
      reason: 'Based on your preference for casual comfort',
      match: 95
    },
    {
      id: 2,
      name: 'Bamboo Jeans',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=300&q=80',
      sustainabilityScore: 8,
      reason: 'Matches your sustainable fashion goals',
      match: 92
    },
    {
      id: 3,
      name: 'Recycled Denim Jacket',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=300&q=80',
      sustainabilityScore: 9,
      reason: 'Perfect for your minimalist style',
      match: 88
    }
  ];

  const userPreferences = {
    style: 'Minimalist & Sustainable',
    budget: 'Mid-range ($50-150)',
    sustainability: 'Very Important',
    colors: ['Neutral', 'Earth tones'],
    materials: ['Organic cotton', 'Bamboo', 'Recycled materials']
  };

  const aiInsights = [
    'You prefer sustainable materials (95% of your views)',
    'Your style leans toward minimalist designs',
    'You often shop in the $50-150 price range',
    'You value high sustainability scores (8+)'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-sage to-gold/30 relative overflow-x-hidden">
      {/* Faint repeating SVG leaf pattern overlay */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 54c-12-8-21-16-21-28C9 14 18 6 30 6s21 8 21 20c0 12-9 20-21 28z\' fill=\'%23e07a5f\' fill-opacity=\'0.18\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat'}} />
      
      {/* Exit Intent Popup */}
      {showExitPopup && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-gold p-8 md:p-12 w-[95vw] max-w-md mx-auto animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl font-bold text-gold hover:text-accent transition-colors bg-sage/40 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setShowExitPopup(false)}
              aria-label="Close"
            >
              ×
            </button>
            
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-2xl font-heading font-bold text-primary mb-3">
                Wait! Don't Miss Out
              </h2>
              <p className="text-stone text-lg mb-6">
                Join <span className="text-gold font-bold">25,000+</span> conscious consumers and get:
              </p>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 bg-sage/30 rounded-lg p-3">
                  <span className="text-2xl">🎁</span>
                  <div className="text-left">
                    <div className="font-bold text-primary">15% OFF</div>
                    <div className="text-sm text-stone">Your first order</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gold/20 rounded-lg p-3">
                  <span className="text-2xl">⭐</span>
                  <div className="text-left">
                    <div className="font-bold text-primary">Premium Access</div>
                    <div className="text-sm text-stone">Exclusive products & deals</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-accent/20 rounded-lg p-3">
                  <span className="text-2xl">💎</span>
                  <div className="text-left">
                    <div className="font-bold text-primary">VIP Perks</div>
                    <div className="text-sm text-stone">Early access & rewards</div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <a
                  href="/login"
                  className="block w-full bg-primary text-gold font-heading font-bold py-4 rounded-full shadow-lg border-2 border-gold hover:bg-accent hover:text-cloud transition-all duration-200 text-lg"
                >
                  Join Now - It's Free!
                </a>
                <button
                  onClick={() => setShowExitPopup(false)}
                  className="block w-full bg-gray-200 text-stone font-medium py-3 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Maybe Later
                </button>
              </div>
              
              <p className="text-xs text-stone/60 mt-4">
                No credit card required • Cancel anytime • 100% free to join
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personalized Quiz Modal */}
      {showQuiz && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in">
          <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-gold p-8 md:p-12 w-[95vw] max-w-lg mx-auto animate-fade-in">
            <button
              className="absolute top-4 right-4 text-2xl font-bold text-gold hover:text-accent transition-colors bg-sage/40 rounded-full w-8 h-8 flex items-center justify-center"
              onClick={() => setShowQuiz(false)}
              aria-label="Close"
            >
              ×
            </button>
            
            <div className="text-center">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-stone/60 mb-2">
                  <span>Question {quizStep + 1} of {quizQuestions.length}</span>
                  <span>{Math.round(((quizStep + 1) / quizQuestions.length) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-gold to-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-4xl mb-4">🎯</div>
              <h2 className="text-2xl font-heading font-bold text-primary mb-6">
                {quizQuestions[quizStep].question}
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {quizQuestions[quizStep].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuizAnswer(option)}
                    className="flex items-center gap-3 p-4 bg-sage/30 rounded-xl border-2 border-gold/30 hover:border-gold hover:bg-gold/20 transition-all duration-200 text-left group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{option.icon}</span>
                    <span className="font-medium text-primary">{option.text}</span>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-stone/60">
                Help us personalize your experience and discover products you'll love!
              </p>
            </div>
          </div>
        </div>
      )}



      {/* Smart Notifications */}
      {showSmartNotification && !user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white/95 backdrop-blur-sm border-2 border-gold rounded-2xl px-8 py-6 shadow-xl flex items-center gap-4 max-w-md mx-4 animate-fade-in">
            <span className="text-3xl">❤️</span>
            <div className="text-center flex-1">
              <div className="font-bold text-primary text-lg mb-2">
                Loving what you see?
              </div>
              <div className="text-stone/80 text-sm">
                Join our community for exclusive access!
              </div>
            </div>
            <button
              onClick={() => setShowSmartNotification(false)}
              className="text-stone/60 hover:text-stone transition-colors text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Logo and brand name at the top, matching login page */}
      <div className="flex flex-col items-center pt-10 pb-2 mb-2">
        <img src="/logo.svg" alt="Ethical Fashion Logo" className="w-16 h-16 mb-2" />
        <span className="font-heading text-2xl font-bold tracking-tight text-primary">Ethical Fashion</span>
      </div>
      {/* Hero Section */}
      <header className="relative pt-32 pb-28 flex items-center justify-center text-center text-stone shadow-lg overflow-hidden min-h-[60vh] z-10">
        <div className="max-w-3xl mx-auto flex flex-col items-center text-center relative z-10" style={heroAnim.style}>
          <div className="flex items-center justify-center gap-3 mb-6">
            <h1 className="text-5xl md:text-6xl font-heading font-extrabold mb-0 drop-shadow-lg text-cloud">
            {user && user.name
                ? <>
                    Welcome back, <span className="text-gold">{user.name}</span>!
                  </>
                : <>
                    Welcome to <span className="text-gold">Ethical Fashion</span>
                  </>}
          </h1>
            {/* Simplified Eco Certified badge */}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-sage text-primary font-bold text-xs shadow border border-gold ml-2 animate-fade-in">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="mr-1"><circle cx="10" cy="10" r="10" fill="#14532d"/><path d="M6 10.5l2.5 2.5L14 7" stroke="#ffd166" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Eco Certified
            </span>
          </div>
          <p className="text-xl md:text-2xl font-sans text-cloud/90 mb-4">Sustainable. Transparent. Fair.</p>
          <p className="text-lg md:text-xl text-stone mb-8">Discover brands and products that make a difference.</p>
        </div>
        
        {/* Simplified Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
          <a
            href="/products"
            className={`relative px-12 py-4 rounded-full bg-gold text-primary font-heading font-bold text-xl shadow-xl border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 transition-all duration-200 flex items-center gap-2 overflow-hidden ${ripple ? 'animate-ripple' : ''}`}
            style={{ boxShadow: '0 8px 32px 0 rgba(224, 122, 95, 0.18)' }}
            onClick={handleRipple}
          >
            {ripple && <span className="absolute left-1/2 top-1/2 w-32 h-32 bg-gold/40 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ripple-effect" />}
            <span className="material-icons">shopping_bag</span>
            Explore Products
          </a>
          
          {/* Show different buttons based on login status */}
          {!user ? (
            <a
              href="/login"
              className="relative px-12 py-4 rounded-full bg-accent text-cloud font-heading font-bold text-xl shadow-xl border-2 border-accent hover:bg-primary hover:text-gold hover:scale-105 transition-all duration-200 flex items-center gap-2 overflow-hidden"
              style={{ boxShadow: '0 8px 32px 0 rgba(224, 122, 95, 0.25)' }}
            >
              <span className="material-icons">person_add</span>
              Join Us Today
            </a>
          ) : (
            <button
              onClick={() => { setShowModal(true); setVideoIndex(0); }}
              className="px-12 py-4 rounded-full bg-white text-accent font-heading font-bold text-xl shadow-xl border-2 border-sage hover:bg-sage hover:text-primary hover:scale-105 transition-all duration-200 flex items-center gap-2"
              style={{ boxShadow: '0 8px 32px 0 rgba(20, 83, 45, 0.12)' }}
            >
              <span className="material-icons">play_circle_filled</span>
              Watch Our Story
            </button>
          )}
        </div>

        {/* Simplified Social Proof for non-logged users */}
        {!user && (
          <div className="mt-8 p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-gold/30 animate-fade-in">
            <p className="text-cloud font-medium">Join <span className="text-gold font-bold">25,000+</span> conscious consumers</p>
          </div>
        )}
      </header>

      {/* Modal for Video Gallery */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl border-4 border-gold p-6 md:p-10 w-[95vw] max-w-2xl mx-auto animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-5 text-3xl font-bold text-gold hover:text-accent transition-colors bg-sage/40 rounded-full w-10 h-10 flex items-center justify-center shadow-md"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <span className="material-icons">close</span>
            </button>
            <div className="flex items-center justify-between mb-4">
              <button
                disabled={videoIndex === 0}
                onClick={() => setVideoIndex(idx => Math.max(0, idx - 1))}
                className={`text-3xl rounded-full p-2 transition-colors ${videoIndex === 0 ? 'opacity-40 cursor-default' : 'hover:bg-gold/30 hover:text-accent'}`}
                aria-label="Previous video"
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <div className="text-primary font-heading font-semibold text-lg md:text-xl">
                {videoLinks[videoIndex].title}
              </div>
              <button
                disabled={videoIndex === videoLinks.length - 1}
                onClick={() => setVideoIndex(idx => Math.min(videoLinks.length - 1, idx + 1))}
                className={`text-3xl rounded-full p-2 transition-colors ${videoIndex === videoLinks.length - 1 ? 'opacity-40 cursor-default' : 'hover:bg-gold/30 hover:text-accent'}`}
                aria-label="Next video"
              >
                <span className="material-icons">chevron_right</span>
              </button>
            </div>
            <iframe
              width="100%"
              height="380"
              src={videoLinks[videoIndex].url}
              title={videoLinks[videoIndex].title}
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="rounded-xl shadow-lg"
            ></iframe>
            <div className="flex gap-2 justify-center mt-5">
              {videoLinks.map((v, idx) => (
                <button
                  key={v.url}
                  onClick={() => setVideoIndex(idx)}
                  className={`w-4 h-4 rounded-full border-2 border-gold transition ${videoIndex === idx ? 'bg-gold' : 'bg-sage'}`}
                  aria-label={`Go to video ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <section className="max-w-6xl mx-auto py-20 px-4 bg-sage/40 rounded-3xl">
        <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary text-center mb-12 tracking-tight">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {features.map((f, idx) => (
          <div
            key={f.title}
              className="bg-white rounded-3xl shadow-xl border-2 border-gold p-10 flex flex-col items-center transition transform hover:-translate-y-2 hover:shadow-2xl hover:bg-gold/10 duration-200 group"
            style={featureAnims[idx].style}
          >
              <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gold/80 text-primary text-4xl mb-6 shadow group-hover:scale-110 transition-transform">{f.icon}</span>
              <h3 className="text-xl font-heading font-bold mb-2 text-primary group-hover:text-accent transition-colors">{f.title}</h3>
              <p className="text-stone text-base text-center font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Member Benefits Section - Only show for non-logged users */}
      {!user && (
        <section className="max-w-6xl mx-auto py-20 px-4 mt-20">
          <div className="bg-gradient-to-br from-accent/20 via-gold/30 to-primary/20 rounded-3xl p-12 border-2 border-gold/30">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary mb-4 tracking-tight">
                Join Our Community
              </h2>
              <p className="text-xl text-stone font-medium mb-6">
                Get exclusive access to sustainable fashion benefits
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {memberBenefits.slice(0, 3).map((benefit, idx) => (
                <div
                  key={benefit.title}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gold/20 hover:border-gold/40 transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-heading font-bold text-primary mb-2">{benefit.title}</h3>
                  <p className="text-stone text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-gold font-heading font-bold text-lg rounded-full shadow-xl border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 transition-all duration-200"
              >
                <span className="material-icons">rocket_launch</span>
                Start Your Journey Today
              </a>
              <p className="text-sm text-stone/70 mt-4">Free to join • No credit card required • Cancel anytime</p>
            </div>
          </div>
        </section>
      )}

      {/* Member-Only Exclusive Content Section */}
      <section className="max-w-6xl mx-auto py-20 px-4 mt-20">
        <div className="bg-gradient-to-br from-primary/10 via-sage/20 to-gold/10 rounded-3xl p-12 border-2 border-gold/20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary mb-4 tracking-tight">
              {user ? "Your Exclusive Member Benefits" : "Member-Only Exclusive Content"}
            </h2>
            <p className="text-xl text-stone font-medium mb-6">
              {user 
                ? "Here's what you have access to as a valued member"
                : "See what you're missing out on - join our community today!"
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Exclusive Deals */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Exclusive Deals</h3>
              <p className="text-stone text-sm mb-4">Get access to member-only discounts and early bird sales</p>
              {user && (
                <div className="bg-gold/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Current Offer:</div>
                  <div className="text-sm text-stone">20% off sustainable basics</div>
                </div>
              )}
            </div>

            {/* Personalized Recommendations */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Smart Recommendations</h3>
              <p className="text-stone text-sm mb-4">AI-powered suggestions based on your style preferences</p>
              {user && (
                <div className="bg-sage/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Your Style:</div>
                  <div className="text-sm text-stone">Minimalist & Sustainable</div>
                </div>
              )}
            </div>

            {/* Community Access */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Community Forum</h3>
              <p className="text-stone text-sm mb-4">Connect with like-minded sustainable fashion enthusiasts</p>
              {user && (
                <div className="bg-accent/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Active Now:</div>
                  <div className="text-sm text-stone">1,247 members online</div>
                </div>
              )}
            </div>

            {/* Impact Tracking */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Impact Dashboard</h3>
              <p className="text-stone text-sm mb-4">Track your environmental footprint and sustainability impact</p>
              {user && (
                <div className="bg-primary/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Your Impact:</div>
                  <div className="text-sm text-stone">-2.3kg CO2 saved this month</div>
                </div>
              )}
            </div>

            {/* Early Access */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">Early Access</h3>
              <p className="text-stone text-sm mb-4">Be the first to shop new sustainable collections</p>
              {user && (
                <div className="bg-gold/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Coming Soon:</div>
                  <div className="text-sm text-stone">Spring Collection - 48h early access</div>
                </div>
              )}
            </div>

            {/* VIP Rewards */}
            <div className={`bg-white rounded-2xl p-6 border-2 ${user ? 'border-gold' : 'border-gray-300'} shadow-lg relative overflow-hidden`}>
              {!user && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                  <div className="text-center text-white">
                    <div className="text-3xl mb-2">🔒</div>
                    <div className="font-bold">Members Only</div>
                  </div>
                </div>
              )}
              <div className="text-4xl mb-4">💎</div>
              <h3 className="text-lg font-heading font-bold text-primary mb-2">VIP Rewards</h3>
              <p className="text-stone text-sm mb-4">Earn points and unlock exclusive member benefits</p>
              {user && (
                <div className="bg-accent/20 rounded-lg p-3">
                  <div className="font-bold text-primary">Your Points:</div>
                  <div className="text-sm text-stone">1,250 points (Gold Level)</div>
                </div>
              )}
            </div>
          </div>

          {/* Call to action for non-logged users */}
          {!user && (
            <div className="text-center mt-12">
              <div className="bg-gradient-to-r from-accent/20 to-gold/20 rounded-2xl p-8 border-2 border-gold/30">
                <h3 className="text-2xl font-heading font-bold text-primary mb-4">
                  Ready to Unlock All These Benefits?
                </h3>
                <p className="text-stone text-lg mb-6">
                  Join our community and start enjoying exclusive member perks today!
                </p>
                <a
                  href="/login"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-gold font-heading font-bold text-lg rounded-full shadow-xl border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 transition-all duration-200"
                >
                  <span className="material-icons">lock_open</span>
                  Unlock Member Access
                </a>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof & Community Section */}
      <section className="max-w-6xl mx-auto py-20 px-4 mt-20">
        <div className="bg-gradient-to-br from-sage/30 via-cloud/80 to-gold/20 rounded-3xl p-12 border-2 border-gold/20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary mb-4 tracking-tight">
              Join Our Thriving Community
            </h2>
            <p className="text-xl text-stone font-medium mb-6">
              See what our members are saying and discover the impact we're making together
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {socialProof.map((stat, index) => (
              <div key={index} className="bg-white/80 rounded-2xl p-6 text-center border border-gold/30 shadow-lg">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-stone">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* User Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {userReviews.map((review) => (
              <div key={review.id} className="bg-white/90 rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-12 h-12 rounded-full border-2 border-gold"
                  />
                  <div className="flex-1">
                    <div className="font-bold text-primary">{review.user}</div>
                    <div className="flex items-center gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="text-gold">⭐</span>
                      ))}
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-gold/20 text-primary px-2 py-1 rounded-full font-bold">
                      ✓ Verified
                    </span>
                  )}
                </div>
                <p className="text-stone text-sm mb-3 italic">"{review.review}"</p>
                <div className="text-xs text-stone/60 mb-3">
                  Purchased: {review.product}
                </div>
                <div className="flex items-center justify-between text-xs text-stone/60">
                  <span>{review.date}</span>
                  <span className="flex items-center gap-1">
                    <span className="material-icons text-sm">thumb_up</span>
                    {review.helpful} helpful
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Community Impact */}
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 border-2 border-gold/30">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-heading font-bold text-primary mb-2">
                Our Community Impact
              </h3>
              <p className="text-stone">
                Together, we're making a real difference in sustainable fashion
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{communityStats.totalMembers.toLocaleString()}</div>
                <div className="text-sm text-stone">Total Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{communityStats.activeToday.toLocaleString()}</div>
                <div className="text-sm text-stone">Active Today</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{communityStats.reviewsPosted.toLocaleString()}</div>
                <div className="text-sm text-stone">Reviews Posted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-1">{communityStats.carbonSaved}t</div>
                <div className="text-sm text-stone">CO2 Saved</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          {!user && (
            <div className="text-center mt-8">
              <a
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-gold font-heading font-bold text-lg rounded-full shadow-xl border-2 border-gold hover:bg-accent hover:text-cloud hover:scale-105 transition-all duration-200"
              >
                <span className="material-icons">group_add</span>
                Join Our Community
              </a>
              <p className="text-sm text-stone/60 mt-4">
                Be part of the sustainable fashion revolution!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Advanced Personalization Section */}
      <section className="max-w-6xl mx-auto py-20 px-4 mt-20">
        <div className="bg-gradient-to-br from-accent/20 via-gold/30 to-primary/20 rounded-3xl p-12 border-2 border-gold/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary mb-4 tracking-tight">
              {user ? "Your Personalized Experience" : "AI-Powered Personalization"}
            </h2>
            <p className="text-xl text-stone font-medium mb-6">
              {user 
                ? "Here's what we've learned about your style preferences"
                : "Discover how AI helps you find the perfect sustainable fashion"
              }
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Personalized Recommendations */}
            <div className="space-y-6">
              <h3 className="text-2xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <span className="text-3xl">🎯</span>
                {user ? "Recommended for You" : "Sample Recommendations"}
              </h3>
              
              <div className="space-y-4">
                {personalizedRecommendations.map((product) => (
                  <div key={product.id} className="bg-white/90 rounded-2xl p-4 border-2 border-gold/30 shadow-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 rounded-xl object-cover border border-gold/30"
                      />
                      <div className="flex-1">
                        <div className="font-bold text-primary">{product.name}</div>
                        <div className="text-sm text-stone mb-1">${product.price}</div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gold/20 text-primary px-2 py-1 rounded-full font-bold">
                            {product.sustainabilityScore}/10
                          </span>
                          <span className="text-xs bg-accent/20 text-primary px-2 py-1 rounded-full font-bold">
                            {product.match}% match
                          </span>
                        </div>
                        <div className="text-xs text-stone/70 italic">{product.reason}</div>
                      </div>
                      {!user && (
                        <div className="text-center">
                          <div className="text-2xl mb-1">🔒</div>
                          <div className="text-xs text-stone/60">Members Only</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!user && (
                <div className="text-center mt-6">
                  <a
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-gold font-bold rounded-full hover:bg-accent hover:text-cloud transition-all duration-200"
                  >
                    <span className="material-icons">psychology</span>
                    Unlock AI Recommendations
                  </a>
                </div>
              )}
            </div>

            {/* User Preferences & AI Insights */}
            <div className="space-y-6">
              <h3 className="text-2xl font-heading font-bold text-primary mb-6 flex items-center gap-2">
                <span className="text-3xl">🧠</span>
                {user ? "Your Style Profile" : "AI Insights"}
              </h3>

              {/* Style Preferences */}
              <div className="bg-white/90 rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Style Preferences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-stone/60">Style</div>
                    <div className="font-semibold text-primary">{userPreferences.style}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone/60">Budget</div>
                    <div className="font-semibold text-primary">{userPreferences.budget}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone/60">Sustainability</div>
                    <div className="font-semibold text-primary">{userPreferences.sustainability}</div>
                  </div>
                  <div>
                    <div className="text-sm text-stone/60">Colors</div>
                    <div className="font-semibold text-primary">{userPreferences.colors.join(', ')}</div>
                  </div>
                </div>
              </div>

              {/* AI Insights */}
              <div className="bg-white/90 rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  AI Insights
                </h4>
                <div className="space-y-3">
                  {aiInsights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <span className="text-gold text-sm mt-1">•</span>
                      <div className="text-sm text-stone">{insight}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Materials Preference */}
              <div className="bg-white/90 rounded-2xl p-6 border-2 border-gold/30 shadow-lg">
                <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                  <span className="text-xl">🌱</span>
                  Preferred Materials
                </h4>
                <div className="flex flex-wrap gap-2">
                  {userPreferences.materials.map((material, index) => (
                    <span key={index} className="bg-sage/30 text-primary px-3 py-1 rounded-full text-sm font-medium border border-sage/50">
                      {material}
                    </span>
                  ))}
                </div>
              </div>

              {!user && (
                <div className="text-center mt-6">
                  <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 border-2 border-gold/30">
                    <h4 className="font-bold text-primary mb-2">Ready for Personalized Shopping?</h4>
                    <p className="text-sm text-stone mb-4">
                      Join our community and get AI-powered recommendations tailored to your style
                    </p>
                    <a
                      href="/login"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-gold font-bold rounded-full hover:bg-accent hover:text-cloud transition-all duration-200"
                    >
                      <span className="material-icons">smart_toy</span>
                      Get Personalized Experience
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Carousel / Testimonials */}
      <section className="max-w-2xl mx-auto py-20 text-center px-4 bg-sage/30 rounded-3xl mt-20">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-gold py-12 px-8 flex flex-col items-center" style={testimonialAnim.style}>
          <div className="text-3xl text-gold mb-4 animate-fade-in">
            <span className="material-icons align-middle mr-2">format_quote</span>
            <span className="italic text-xl text-stone align-middle">{carouselItems[current].quote}</span>
            <span className="material-icons align-middle ml-2">format_quote</span>
          </div>
          <div className="flex flex-col items-center mt-4">
            <img
              src={carouselItems[current].avatar}
              alt={carouselItems[current].author}
              className="w-20 h-20 rounded-full border-4 border-gold mb-3 shadow-lg object-cover"
            />
            <span className="font-semibold text-primary text-lg">{carouselItems[current].author}</span>
            {/* Add member badge for testimonials */}
            <span className="inline-flex items-center gap-1 bg-gold/20 text-primary px-3 py-1 rounded-full text-xs font-semibold mt-2">
              <span className="material-icons text-sm">verified</span>
              Verified Member
            </span>
          </div>
          <div className="flex gap-2 justify-center mt-6">
            {carouselItems.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`w-3 h-3 rounded-full transition ${current === idx ? 'bg-gold' : 'bg-sage'}`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
          
          {/* Additional social proof for non-logged users */}
          {!user && (
            <div className="mt-8 p-4 bg-sage/40 rounded-xl border border-gold/20">
              <p className="text-sm text-stone font-medium mb-2">What our members say:</p>
              <div className="flex items-center justify-center gap-4 text-xs text-stone/70">
                <span className="flex items-center gap-1">
                  <span className="material-icons text-gold text-sm">favorite</span>
                  98% satisfaction
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-icons text-gold text-sm">trending_up</span>
                  15% average savings
                </span>
                <span className="flex items-center gap-1">
                  <span className="material-icons text-gold text-sm">groups</span>
                  25K+ members
                </span>
              </div>
            </div>
          )}
        </div>
      </section>



      {/* Sustainability Stats Bar */}
      <section className="max-w-5xl mx-auto mb-32 px-4">
        <div className="bg-gold/30 rounded-3xl py-12 px-6 flex flex-col md:flex-row justify-center gap-10 items-center shadow-xl">
          {/* Stat: Brands */}
          <div className="flex-1 flex flex-col items-center p-8 min-w-[140px] animate-fade-in">
            <span className="material-icons text-5xl text-gold mb-2">spa</span>
            <div className="text-4xl font-extrabold text-primary mb-1">100+</div>
            <div className="text-lg font-semibold text-stone">Brands</div>
          </div>
          {/* Stat: Products */}
          <div className="flex-1 flex flex-col items-center p-8 min-w-[140px] animate-fade-in">
            <span className="material-icons text-5xl text-gold mb-2">checkroom</span>
            <div className="text-4xl font-extrabold text-primary mb-1">10,000+</div>
            <div className="text-lg font-semibold text-stone">Products</div>
          </div>
          {/* Stat: Countries */}
          <div className="flex-1 flex flex-col items-center p-8 min-w-[140px] animate-fade-in">
            <span className="material-icons text-5xl text-gold mb-2">language</span>
            <div className="text-4xl font-extrabold text-primary mb-1">50+</div>
            <div className="text-lg font-semibold text-stone">Countries</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-cloud py-8 mt-12">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-3">
            {/* Placeholder logo SVG */}
            <span className="inline-block bg-gold rounded-full p-2">
              <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="24" cy="24" r="24" fill="#ffd166"/>
                <path d="M24 36c-6-4-10-8-10-14 0-5 4-9 10-9s10 4 10 9c0 6-4 10-10 14z" fill="#14532d"/>
                <text x="24" y="28" textAnchor="middle" fontFamily="Montserrat, sans-serif" fontSize="13" fontWeight="bold" fill="#e07a5f">EF</text>
              </svg>
            </span>
            <span className="font-heading text-xl font-bold tracking-tight">Ethical Fashion</span>
          </div>
          <div className="flex gap-4 text-gold text-2xl">
            <a href="#" aria-label="Twitter" className="hover:text-cloud transition"><span className="material-icons">twitter</span></a>
            <a href="#" aria-label="Instagram" className="hover:text-cloud transition"><span className="material-icons">instagram</span></a>
            <a href="#" aria-label="Facebook" className="hover:text-cloud transition"><span className="material-icons">facebook</span></a>
          </div>
          <div className="text-cloud/80 text-sm">&copy; {new Date().getFullYear()} Ethical Fashion. All rights reserved.</div>
        </div>
      </footer>

      {/* Animations (CSS) */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(.4,0,.2,1);
        }
        @keyframes ripple-effect {
          0% { transform: scale(0); opacity: 0.7; }
          80% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(2); opacity: 0; }
        }
        .animate-ripple-effect {
          animation: ripple-effect 0.4s linear;
        }
      `}</style>
    </div>
  );
};

export default Home;