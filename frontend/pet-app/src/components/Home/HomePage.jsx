import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";
// --- Constants (Thay thế các đường dẫn file ảnh cục bộ bằng Placeholder URL) ---
const PLACEHOLDERS = {
  AVATAR: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg',
  HERO: 'https://images.pexels.com/photos/46024/pexels-photo-46024.jpeg',
  GROOMING: 'https://images.pexels.com/photos/6130977/pexels-photo-6130977.jpeg',
  WALKING: 'https://images.pexels.com/photos/5749775/pexels-photo-5749775.jpeg',
  SITTING: 'https://images.pexels.com/photos/3448793/pexels-photo-3448793.jpeg',
};

// --- Custom CSS String (Mã CSS gốc của bạn được đưa vào đây để đảm bảo độ chính xác) ---
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

/* LƯU Ý QUAN TRỌNG: Loại bỏ max-width: 1200px khỏi container để nó tự động chiếm hết chiều rộng còn lại của màn hình sau khi header hệ thống đã hiển thị. */
.container {
    width: 100%;
    /* max-width: 1200px; - Đã xóa theo yêu cầu sửa lỗi 2 Header */
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


/* --- NÚT BẤM CHUNG --- */
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

/* --- HEADER (Thanh điều hướng) --- */
/* Đã giữ lại style header và đặt nó vào một component riêng, nhưng sẽ không gọi component này trong App để giải quyết vấn đề 2 Header */
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

.hidden lg:flex items-center gap-8 {

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

/* Profile */


/* Ô tìm kiếm */
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

/* Chuông thông báo */
.fa-bell {
    color: #29a980;
    background-color: #e8f7f0;
    padding: 12px;
    border-radius: 10px;
    transition: background-color 0.3s ease;
}

.fa-bell:hover {
    background-color: #d8f5e7;
}

.profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    background-color: #ccc; /* Placeholder màu xám cho ảnh */
}
    
.profile-avatar:hover {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

/* --- MAIN CONTENT --- */
.content {
    padding: 30px;
}

/* PHẦN QUAN TRỌNG: Căn lề trái cho toàn bộ nội dung trong section */
section {
    padding: 40px 0;
    text-align: left; 
    padding: 40px 30px;
}

section p {
    max-width: 600px;
}

/* --- SECTION 1: HERO --- */
.hero-section {
    padding: 0;
}

.hero-card {
    position: relative;
    width: 100%;
    height: 500px;
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
    align-items: center;
    text-align: left;
    color: #d3fff6;
    background: rgba(0, 0, 0, 0.2); 
}

.hero-overlay h1 {
    font-size: 3.5em;
    font-weight: 900;
    margin-bottom: 10px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-overlay p {
    max-width: 600px;
    margin-bottom: 30px;
    font-size: 1.1em;
    text-align: center;
}


/* --- SECTION 2: EXPLORE PETCARE+ --- */
.explore-section {
    padding-top: 50px;
    padding-bottom: 50px;
}

.features-grid {
    display: flex;
    justify-content: space-between; 
    gap: 30px;
    margin-top: 40px;
    width: 100%; 
}

.feature-card {
    background-color: var(--card-bg);
    padding: 20px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    width: 31%; 
    text-align: left;
    min-height: 150px;
    transition: box-shadow 0.3s;
}

.feature-card:hover {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
}

.icon-small {
    font-size: 1.5em;
    color: var(--primary-color);
    margin-bottom: 10px;
}

.feature-card h4 {
    font-weight: 600;
}

.feature-card p {
    color: #4F946B;
    font-size: 0.9em;
}


/* --- SECTION 3: FIND THE BEST CARE --- */
.care-section {
    margin-top: -20px;
    background-color: var(--card-bg);
    padding: 60px 30px;
}

/* Loại bỏ căn giữa cho tiêu đề, đoạn văn và nút */
.care-section p, .care-section h2 {
    text-align: left;
    max-width: 600px;
    margin: 0 0 15px 0; 
}

.care-section .btn-primary {
    margin-bottom: 40px;
    display: inline-block;
}

.services-grid {
    display: flex;
    justify-content: space-between;
    gap: 20px;
    max-width: 100%; /* Đảm bảo chiếm đủ chiều rộng */
    margin: 0;
    text-align: left;
}

.service-card {
    width: 32%;
}

.service-image {
    width: 100%;
    height: 180px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 10px;
    background-color: #ddd; /* Placeholder màu xám cho ảnh */
}

.service-card h4 {
    margin-bottom: 5px;
    font-weight: 600;
}

.service-card p {
    font-size: 0.9em;
    color: #4F946B;
}


/* --- SECTION 4: GET INSTANT SUPPORT --- */
.support-section {
    padding: 60px 30px;
    margin-top: -20px;
}

.support-section a {
    margin-top: 22px;
}

.support-grid {
    display: flex;
    /* Dùng flex-start để dồn sát trái, không bị căn giữa */
    justify-content: flex-start; 
    gap: 40px;
    margin-top: 40px;
}

.support-card {
    background-color: var(--card-bg);
    padding: 25px;
    border: 1px solid var(--border-color);
    border-radius: 10px;
    width: 350px;
    text-align: left;
}

.support-card i {
    font-size: 2em;
    color: var(--primary-color);
}

.support-card h4 {
    font-weight: 600;
}

.support-card p {
    color: #4F946B;
}


/* --- FOOTER --- */
.footer {
    text-align: center;
    padding: 20px 0;
    border-top: 1px solid var(--border-color);
    background-color: var(--card-bg);
}

.footer-links {
    margin-bottom: 15px;
    display: flex;
    justify-content: center;
    gap: 25px;
}

.footer-links a {
    color: var(--text-dark);
    font-size: 0.9em;
}

.social-icons {
    margin-bottom: 10px;
    display: flex;
    justify-content: center;
    gap: 15px;
}

.social-icons i {
    color: var(--text-light);
    font-size: 1.1em;
}

.footer p {
    font-size: 0.8em;
    color: var(--text-light);
}

/* --- MOBILE RESPONSIVENESS --- */
@media (max-width: 768px) {
    .header {
        padding: 15px 20px;
    }
    .navbar {
        display: none; 
    }
    .search-box {
        display: none; 
    }
    .hero-card {
        height: 350px;
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
        padding: 30px 20px;
    }
    .features-grid, .services-grid, .support-grid {
        flex-direction: column;
        gap: 20px;
    }
    .feature-card, .service-card, .support-card {
        width: 100%;
        max-width: 100%;
    }
    .service-image {
        height: 150px;
    }
}
`;


// --- Reusable Components (Sử dụng các lớp CSS gốc) ---

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
      // Xử lý lỗi ảnh bằng placeholder
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x180/ddd/333?text=Image+Missing'; }}
    />
    <h4>{title}</h4>
    <p>{description}</p>
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

  const handleAvatarClick = () => {
    navigate('/dashBoard'); // Chuyển sang trang Dashboard
  };

  const goToReminders = () => {
    navigate("/dashboard", { state: { scrollTo: "reminders" } });
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

         {/* Nút chuông: chuyển sang Dashboard và cuộn tới Reminders */}
        <i 
          className="fa-regular fa-bell" 
          onClick={goToReminders} 
          style={{ cursor: 'pointer' }}
        ></i>
        <div className="user-profile">
          <img
            src={PLACEHOLDERS.AVATAR}
            alt="User"
            className="profile-avatar"
            onClick={handleAvatarClick}
            style={{ cursor: 'pointer' }}/>
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
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'https://placehold.co/1200x500/1ec714/ffffff?text=Pet+Care+Hero'; 
        }}/>

      <div className="hero-overlay">
        <h1>Welcome to PetCare+</h1>
        <p>Your all-in-one platform for managing your pet's life and connecting with trusted vendors, vets, and products.</p>
        <Link to="/mypets" className="btn btn-primary">
          Get Started
        </Link>
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

// --- Main App Component ---

const HomePage = () => { 
  return (
    // Fragment để bao gồm Font Awesome và Styles
    <>
      {/* 1. Font Awesome CDN (bắt buộc để hiển thị icons) */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" />
      {/* 2. Custom CSS Styles */}
      <style>{CSS_STYLES}</style>

      {/* 3. HTML Structure (Đã chuyển đổi sang JSX) */}
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

export default HomePage;