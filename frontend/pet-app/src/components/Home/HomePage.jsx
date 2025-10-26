import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ... (các import khác giữ nguyên)

// --- Constants ---
const PLACEHOLDERS = {
  AVATAR: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
  HERO: 'https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg',
  GROOMING: 'https://images.pexels.com/photos/6130977/pexels-photo-6130977.jpeg',
  WALKING: 'https://images.pexels.com/photos/5749775/pexels-photo-5749775.jpeg',
  SITTING: 'https://images.pexels.com/photos/3448793/pexels-photo-3448793.jpeg',
};

// --- Custom CSS String (giữ nguyên) ---
const CSS_STYLES = `
/* Thiết lập cơ bản (Sử dụng các biến màu từ CSS gốc của bạn) */
:root {
    --primary-color: #29a980; /* Màu xanh lá cho nút chính */
    --secondary-color: #29a980; /* Màu xanh lá nhạt hơn */
    --text-dark: #333;
    --text-light: #777;
    --bg-light: #f7f7f7; /* Màu nền nhẹ */
    --border-color: #ddd;
    --card-bg: #fff;
    --font-family: 'Inter', Arial, sans-serif; /* Sử dụng Inter làm mặc định, kèm dự phòng Arial */
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-dark);
    background-color: var(--bg-light);
    display: flex;
    justify-content: center;
    padding-bottom: 50px;
}

/* Container */
.container {
    width: 100%;
    /* max-width: 1200px; - Removed */
    background-color: var(--card-bg);
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
}

a {
    text-decoration: none;
    color: var(--primary-color);
}

h1 { font-size: 2.5em; }
h2 {
    font-size: 2em;
    margin-bottom: 10px;
    font-weight: 700;
}
h4 { font-size: 1.2em; margin-top: 5px; }


/* --- BUTTONS --- */
.btn {
    display: inline-block;
    padding: 10px 25px;
    border-radius: 12px;
    font-weight: bold;
    font-size: 18px;
    text-align: center;
    transition: background-color 0.3s;
    border: none;
    cursor: pointer;
}

.btn-primary {
    background-color: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background-color: #1d926dff;
}

.btn-secondary {
    background-color: var(--primary-color);
    color: #fff;
    border: 2px solid var(--primary-color);
    margin-top: 20px;
}

.btn-secondary:hover {
    background-color: #1d926dff;
    color: #fff;
}

/* --- HEADER --- */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    border-bottom: 1px solid var(--border-color);
    background-color: var(--card-bg);
    position: sticky;
    top: 0;
    z-index: 100;
}

.text-xl {
    margin: 0;
}

.hidden.lg\\:flex.items-center.gap-8 { /* Specific selector adjustment */
    /* Add specific styles if needed, otherwise this is handled by Tailwind */
}


.logo {
    font-size: 1.5em;
    font-weight: bold;
    color: var(--primary-color);
}

.navbar {
    margin-top: 4px;
    margin-left: -200px;
    transform: translateX(-10%);
    display: flex;
    gap: 25px;
}

.nav-link {
    color: var(--text-dark);
    padding: 5px 10px;
    transition: color 0.3s, border-bottom 0.3s;
}

.nav-link.active {
    font-weight: bold;
    border-bottom: 2px solid var(--primary-color);
    color: var(--primary-color);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

/* Search Box */
.search-box {
    display: flex;
    align-items: center;
    background-color: #e8f7f0;
    border-radius: 9px;
    padding: 8px 15px;
    border: none;
    transition: background-color 0.3s ease, box-shadow 0.3s ease;
}

.search-box input {
    border: none;
    background: transparent;
    margin-left: 10px;
    outline: none;
    width: 90px;
    font-size: 14px;
    color: #333;
}

.search-box i {
    color: #29a980;
    font-size: 16px;
}

.search-box:hover {
    background-color: #d8f5e7;
    box-shadow: 0 0 5px rgba(0, 128, 0, 0.1);
}

.search-box:focus-within {
    background-color: #d8f5e7;
    box-shadow: 0 0 8px rgba(0, 128, 0, 0.15);
}

/* Bell Icon (inside button) */
.header-actions .relative button i.fa-bell {
  color: #333; /* Default text color */
  transition: color 0.3s ease;
  font-size: 1.3rem; /* Adjust size if needed */
  background-color: transparent; /* Remove background if it's on the button now */
  padding: 0; /* Remove padding */
}
.header-actions .relative button:hover i.fa-bell {
  color: var(--primary-color); /* Hover color */
}

/* User Profile Avatar */
.profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #ccc; /* Placeholder color */
    cursor: pointer; /* Add cursor pointer */
    transition: transform 0.2s ease;
}

.profile-avatar:hover {
  transform: scale(1.05);
}

/* Red Dot Notification */
.header-actions .relative .absolute {
  /* Tailwind classes handle positioning and appearance */
}


/* --- MAIN CONTENT --- */
.content {
    padding: 30px;
}

section {
    padding: 40px 30px; /* Consistent padding */
    text-align: left; /* Ensure left alignment */
}

section p {
    max-width: 600px; /* Limit paragraph width */
    color: var(--text-light); /* Lighter text for paragraphs */
    margin-bottom: 15px; /* Spacing below paragraphs */
}

/* --- HERO SECTION --- */
.hero-section {
    padding: 0; /* Remove padding to allow hero card full width */
}

.hero-card {
    position: relative;
    width: 100%;
    height: 500px; /* Adjust height as needed */
    border-radius: 15px;
    overflow: hidden;
}

.hero-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    /* align-items: center; Centering text elements */
    align-items: flex-start; /* Align text to the left */
    text-align: left; /* Ensure text alignment is left */
    color: #fff; /* White text for better contrast */
    background: rgba(0, 0, 0, 0.3); /* Darker overlay for readability */
    padding: 0 5%; /* Add some horizontal padding */
}


.hero-overlay h1 {
    font-size: 3.5em;
    font-weight: 900;
    margin-bottom: 15px;
    text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.6);
}

.hero-overlay p {
    max-width: 600px;
    margin-bottom: 30px;
    font-size: 1.2em;
    color: #eee; /* Slightly off-white */
    text-align: left; /* Explicitly set text align left */
}

.hero-overlay .btn-primary {
  margin-top: 10px; /* Add some space above the button */
}


/* --- EXPLORE SECTION --- */
.explore-section {
    padding-top: 60px; /* Increase top padding */
    padding-bottom: 60px; /* Increase bottom padding */
}

.features-grid {
    display: flex;
    justify-content: space-between;
    gap: 30px;
    margin-top: 40px;
}

.feature-card {
    background-color: var(--card-bg);
    padding: 25px; /* Increase padding */
    border: 1px solid #eee; /* Lighter border */
    border-radius: 12px; /* Slightly larger radius */
    width: 31%;
    text-align: left;
    transition: box-shadow 0.3s, transform 0.3s; /* Add transform transition */
    min-height: 180px; /* Increase min height */
}

.feature-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Enhance shadow */
    transform: translateY(-5px); /* Lift card on hover */
}

.icon-small {
    font-size: 1.8em; /* Increase icon size */
    color: var(--primary-color);
    margin-bottom: 15px; /* More space below icon */
}

.feature-card h4 {
    font-weight: 700; /* Bolder title */
    margin-bottom: 8px; /* Space below title */
}

.feature-card p {
    color: var(--text-light);
    font-size: 0.95em; /* Slightly larger text */
    line-height: 1.5;
}


/* --- CARE SECTION --- */
.care-section {
    background-color: #f0fdf4; /* Light green background */
    padding: 60px 30px;
    border-radius: 15px; /* Rounded corners for the section */
    margin-top: 30px; /* Add margin top */
}

.care-section h2 {
    margin-bottom: 15px;
}

.care-section p {
    margin-bottom: 25px;
}

.care-section .btn-primary {
    margin-bottom: 40px;
}

.services-grid {
    display: flex;
    justify-content: space-between;
    gap: 30px; /* Increased gap */
}

.service-card {
    width: 31%; /* Adjust width for gap */
    background-color: var(--card-bg);
    border-radius: 12px;
    overflow: hidden; /* Ensure image corners are rounded */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s, transform 0.3s;
}

.service-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
}


.service-image {
    width: 100%;
    height: 200px; /* Increased height */
    object-fit: cover;
    display: block; /* Remove extra space below image */
}

.service-card-content { /* Add a content wrapper for padding */
    padding: 20px;
}


.service-card h4 {
    margin-bottom: 8px;
    font-weight: 700;
}

.service-card p {
    font-size: 0.9em;
    color: var(--text-light);
    line-height: 1.5;
}


/* --- SUPPORT SECTION --- */
.support-section {
    padding: 60px 30px;
    margin-top: 30px; /* Add margin top */
}

.support-section h2 {
    margin-bottom: 15px;
}

.support-section p {
    margin-bottom: 25px;
}

.support-section .btn-primary {
     margin-bottom: 40px; /* Add margin below button */
}


.support-grid {
    display: flex;
    justify-content: flex-start; /* Keep left alignment */
    gap: 30px; /* Consistent gap */
    margin-top: 40px;
}

.support-card {
    background-color: var(--card-bg);
    padding: 30px; /* Increase padding */
    border: 1px solid #eee; /* Lighter border */
    border-radius: 12px;
    width: calc(50% - 15px); /* Adjust width for 2 cards with gap */
    text-align: left;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
    transition: box-shadow 0.3s, transform 0.3s;
}

.support-card:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    transform: translateY(-5px);
}


.support-card i {
    font-size: 2em;
    color: var(--primary-color);
    margin-bottom: 15px; /* Space below icon */
}

.support-card h4 {
    font-weight: 700;
    margin-bottom: 8px;
}

.support-card p {
    color: var(--text-light);
    font-size: 0.95em;
    line-height: 1.5;
}


/* --- FOOTER --- */
.footer {
    text-align: center;
    padding: 30px 0; /* Increased padding */
    border-top: 1px solid #eee; /* Lighter border */
    background-color: var(--card-bg);
    margin-top: 40px; /* Add margin top */
}

.footer-links {
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
    gap: 30px; /* Increased gap */
}

.footer-links a {
    color: var(--text-dark);
    font-size: 0.95em;
    transition: color 0.3s;
}
.footer-links a:hover {
    color: var(--primary-color);
}

.social-icons {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    gap: 20px; /* Increased gap */
}

.social-icons i {
    color: var(--text-light);
    font-size: 1.3em; /* Slightly larger icons */
    transition: color 0.3s;
}
.social-icons i:hover {
    color: var(--primary-color);
}

.footer p {
    font-size: 0.85em; /* Slightly larger text */
    color: #aaa; /* Lighter gray */
}

/* --- MOBILE RESPONSIVENESS --- */
@media (max-width: 768px) {
    .header {
        padding: 15px 20px;
    }
    .navbar {
        display: none; /* Hide navbar on small screens */
    }
    .search-box {
        display: none; /* Hide search box */
    }
    .hero-card {
        height: 350px; /* Adjust hero height */
    }
    .hero-overlay h1 {
        font-size: 2.5em;
    }
    .hero-overlay p {
        font-size: 1em;
        max-width: 90%;
    }
    .content {
        padding: 20px;
    }
    section {
        padding: 40px 20px; /* Adjust section padding */
    }
    .features-grid, .services-grid, .support-grid {
        flex-direction: column; /* Stack cards vertically */
        gap: 25px; /* Adjust gap */
    }
    .feature-card, .service-card, .support-card {
        width: 100%; /* Full width cards */
        max-width: 100%;
    }
    .service-image {
        height: 180px; /* Adjust service image height */
    }
    .support-card {
        width: 100%; /* Full width support cards */
    }

    .hero-overlay {
        align-items: center; /* Center align overlay content on mobile */
        text-align: center;
        padding: 0 10%; /* Adjust padding */
    }
    .hero-overlay p {
        text-align: center; /* Center align paragraph */
    }

}
`;


// --- Reusable Components ---
const NavLink = ({ href, children, isActive }) => (
  <a href={href} className={`nav-link ${isActive ? 'active' : ''}`}>
    {children}
  </a>
);

const FeatureCard = ({ iconClass, title, description }) => (
  <div className="feature-card">
    <i className={`${iconClass} icon-small`}></i>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);

const ServiceCard = ({ imageUrl, altText, title, description }) => (
  <div className="service-card">
    <img
      src={imageUrl}
      alt={altText}
      className="service-image"
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x200/ddd/333?text=Image+Missing'; }} // Updated placeholder size
    />
    {/* Wrap content for padding */}
    <div className="service-card-content">
        <h4>{title}</h4>
        <p>{description}</p>
    </div>
  </div>
);

const SupportCard = ({ iconClass, title, description }) => (
  <div className="support-card">
    <i className={`${iconClass} icon-small`}></i>
    <h4>{title}</h4>
    <p>{description}</p>
  </div>
);


// --- Layout Sections ---
const Header = () => {
  const navigate = useNavigate();
  const [hasNewReminders, setHasNewReminders] = useState(false);

  // Function to fetch and check reminders (giữ nguyên)
  const checkNewReminders = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/reminders");
      if (!res.ok) {
        setHasNewReminders(false); // Assume no new ones if fetch fails
        console.warn(`Failed to fetch reminders for notification check: ${res.status}`);
        return; // Exit early on error
      }
      const data = await res.json();
      const newExists = Array.isArray(data) && data.some(r => r.is_new_today === true);
      setHasNewReminders(newExists);
    } catch (err) {
      console.error("❌ Error checking new reminders:", err);
      setHasNewReminders(false); // Reset on error
    }
  };


  // Fetch reminders on mount (giữ nguyên)
  useEffect(() => {
    checkNewReminders();
    // Optional: Set interval for periodic checks
    // const intervalId = setInterval(checkNewReminders, 60000); // Check every minute
    // return () => clearInterval(intervalId);
  }, []);

  const handleAvatarClick = () => {
    navigate('/dashboard');
  };

  // ✅ Hàm xử lý khi nhấn vào chuông: CHỈ điều hướng
  const handleBellClick = () => {
    navigate('/dashboard');
  };


return (
    <header className="header">
      <div className="logo">PetCare+</div>
      <nav className="navbar">
        <NavLink href="#" isActive={true}>Trang chủ</NavLink>
        <NavLink href="#">Giới thiệu</NavLink>
        <NavLink href="#">Chính sách & Bảo mật</NavLink>
        <NavLink href="#">Liên hệ</NavLink>
      </nav>
      <div className="header-actions">
        <div className="search-box">
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Tìm kiếm" />
        </div>
        {/* --- Bell Button --- */}
        <div className="relative">
          <button
            onClick={handleBellClick} // Chỉ điều hướng
            className="text-gray-700 hover:text-green-700 focus:outline-none p-2 rounded-full hover:bg-green-100 transition-colors duration-150"
            aria-label="Reminders"
            title="View Reminders"
          >
            <i className="fa-regular fa-bell text-xl"></i>
          </button>
          {/* Chấm đỏ */}
          {hasNewReminders && (
            <span
              className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"
              aria-hidden="true"
            ></span>
          )}
        </div>
        {/* --- Profile --- */}
        <div className="user-profile">
          <img
            src={PLACEHOLDERS.AVATAR}
            alt="User"
            className="profile-avatar"
            onClick={handleAvatarClick}
          />
        </div>
      </div>
    </header>
  );
};


const HeroSection = () => (
  <section className="hero-section">
    <div className="hero-card">
      <img
        src={PLACEHOLDERS.HERO}
        alt="Dog and Cat"
        className="hero-image"
        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/1200x500/1ec714/ffffff?text=Pet+Care+Hero'; }}
      />
      <div className="hero-overlay">
        <h1>Welcome to PetCare+</h1>
        <p>Your all-in-one platform for managing your pet's life and connecting with trusted vendors, vets, and products.</p>
        <a href="#" className="btn btn-primary">Get Started</a>
      </div>
    </div>
  </section>
);

const ExploreSection = () => (
  <section className="explore-section">
    <h2>Explore PetCare+</h2>
    <p>Discover the features that make PetCare+ the ultimate platform for pet owners and vendors.</p>
    <a href="#" className="btn btn-secondary">Learn More</a>

    <div className="features-grid">
      <FeatureCard
        iconClass="fa-solid fa-paw"
        title="Pet Owner Features"
        description="Track health records, appointments, and care schedules with ease."
      />
      <FeatureCard
        iconClass="fa-solid fa-store"
        title="Vendor Services"
        description="Gain access to a wide network of pet owners and manage your business efficiently."
      />
      <FeatureCard
        iconClass="fa-solid fa-cart-shopping"
        title="Marketplace"
        description="Easily purchase a wide range of pet products from trusted vendors."
      />
    </div>
  </section>
);

const CareSection = () => (
  <section className="care-section">
    <h2>Find the Best Care for Your Pet</h2>
    <p>Connect with top-rated vendors offering a variety of services to keep your pet happy and healthy.</p>
    <a href="#" className="btn btn-primary">Find a Vendor</a>

    <div className="services-grid">
      <ServiceCard
        imageUrl={PLACEHOLDERS.GROOMING}
        altText="Grooming"
        title="Grooming"
        description="Connect with professional grooming services to keep your pet looking their best."
      />
      <ServiceCard
        imageUrl={PLACEHOLDERS.WALKING}
        altText="Walking"
        title="Walking"
        description="Book professional walking services to ensure your pet gets the exercise they need."
      />
      <ServiceCard
        imageUrl={PLACEHOLDERS.SITTING}
        altText="Sitting"
        title="Sitting"
        description="Find trusted pet sitting services for when you're away from home."
      />
    </div>
  </section>
);

const SupportSection = () => (
  <section className="support-section">
    <h2>Get Instant Support</h2>
    <p>Our AI chatbot is here to assist you with any questions or concerns you may have.</p>
    <a href="#" className="btn btn-primary">Chat with AI</a>

    <div className="support-grid">
      <SupportCard
        iconClass="fa-solid fa-robot"
        title="AI Chatbot"
        description="Get quick answers to your questions about pet care, products, and services."
      />
      <SupportCard
        iconClass="fa-solid fa-circle-info"
        title="Help Center"
        description="Access our comprehensive help center for detailed information and guides."
      />
    </div>
  </section>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-links">
      <a href="#">About Us</a>
      <a href="#">Contact</a>
      <a href="#">Terms of Service</a>
      <a href="#">Privacy Policy</a>
    </div>
    <div className="social-icons">
      <i className="fa-brands fa-twitter"></i>
      <i className="fa-brands fa-facebook-f"></i>
      <i className="fa-brands fa-instagram"></i>
      <i className="fa-brands fa-linkedin-in"></i>
    </div>
    <p>©2024 PetCare+. All rights reserved.</p>
  </footer>
);

// --- Main App Component (Renamed to HomePage) ---
const HomePage = () => {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      <style>{CSS_STYLES}</style>
      <div className="container">
        <Header />
        <main className="content">
          <HeroSection />
          <ExploreSection />
          <CareSection />
          <SupportSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default HomePage; // Export with the correct name