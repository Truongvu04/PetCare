import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import api from "../../api/axiosConfig.js";
import { healthApi } from "../../api/healthApi.js";
import { expenseApi } from "../../api/expenseApi.js";
import LoginForm from "../Auth/LoginForm";

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


/* 🟢 ĐÃ SỬA: Đổi màu nền của nút Đăng nhập và Đăng ký để trùng với màu chủ đạo */
.btn-login {
  background: var(--primary-color); /* Sử dụng màu xanh lá cây chủ đạo */
}

.btn-login:hover {
  background: #1d926dff; /* Màu hover tương tự btn-primary */
}

.btn-register {
  background: var(--primary-color); /* Sử dụng màu xanh lá cây chủ đạo */
}

.btn-register:hover {
  background: #1d926dff; /* Màu hover tương tự btn-primary */
  box-shadow: 0 0 10px rgba(41, 169, 128, 0.5); /* Thay đổi màu bóng cho phù hợp */
}

/* Profile */

/* Chuông thông báo */

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
        height: 300px;
    }
    .hero-overlay h1 {
        font-size: 2em;
        padding: 0 20px;
    }
    .hero-overlay p {
        font-size: 0.9em;
        max-width: 90%;
        padding: 0 20px;
    }
    .content {
        padding: 15px;
    }
    section {
        padding: 30px 15px;
    }
    .features-grid, .services-grid, .support-grid {
        flex-direction: column;
        gap: 15px;
    }
    .feature-card, .service-card, .support-card {
        width: 100%;
        max-width: 100%;
    }
    .service-image {
        height: 180px;
    }
    .btn {
        padding: 8px 20px;
        font-size: 16px;
    }
    h2 {
        font-size: 1.5em;
    }
    h4 {
        font-size: 1em;
    }
}

@media (max-width: 480px) {
    .hero-card {
        height: 250px;
        border-radius: 10px;
    }
    .hero-overlay h1 {
        font-size: 1.5em;
    }
    .hero-overlay p {
        font-size: 0.85em;
    }
    .content {
        padding: 10px;
    }
    section {
        padding: 20px 10px;
    }
    .btn {
        padding: 8px 16px;
        font-size: 14px;
    }
    h2 {
        font-size: 1.3em;
    }
}
`;

// --- Reusable Components (Sử dụng các lớp CSS gốc) ---

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
      onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/300x180/ddd/333?text=Image+Missing'; }}/>
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

// --- HEADER ---
const Header = ({ onLoginClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const [hasNewReminders, setHasNewReminders] = useState(false);
  const [hasNewHealth, setHasNewHealth] = useState(false);
  const [hasNewExpenses, setHasNewExpenses] = useState(false);

  const getReadStatusKey = (type) => {
    const today = new Date().toISOString().split('T')[0];
    return `read_${type}_${user?.user_id || 'guest'}_${today}`;
  };

  const isRead = (type) => {
    if (!user) return true;
    const key = getReadStatusKey(type);
    return localStorage.getItem(key) === 'true';
  };

  useEffect(() => {
    let isMounted = true;
    let intervalId = null;
    
    const checkForNewData = async () => {
      if (user) {
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          const remindersRes = await api.get("/reminders");
          let hasNewReminder = false;
          if (isMounted && Array.isArray(remindersRes.data)) {
            hasNewReminder = remindersRes.data.some(r => r.is_new_today === true);
          }

          const petsRes = await api.get("/pets");
          let hasNewHealthRecord = false;
          if (isMounted && Array.isArray(petsRes.data) && petsRes.data.length > 0) {
            for (const pet of petsRes.data) {
              try {
                const healthRes = await healthApi.getHealthRecords(pet.id);
                if (healthRes && healthRes.success && Array.isArray(healthRes.records)) {
                  const todayHealthRecords = healthRes.records.filter(r => {
                    const recordDate = new Date(r.record_date);
                    return recordDate >= today && recordDate < tomorrow;
                  });
                  if (todayHealthRecords.length > 0) {
                    hasNewHealthRecord = true;
                    break;
                  }
                }
              } catch (err) {
                console.error(`Error checking health for pet ${pet.id}:`, err);
              }
            }
          }

          let hasNewExpense = false;
          try {
            const expensesRes = await expenseApi.getExpenses();
            if (expensesRes && expensesRes.success && Array.isArray(expensesRes.expenses)) {
              hasNewExpense = expensesRes.expenses.some(e => {
                const expenseDate = new Date(e.expense_date);
                return expenseDate >= today && expenseDate < tomorrow;
              });
            }
          } catch (err) {
            console.error("Error checking expenses:", err);
          }

          if (isMounted) {
            setHasNewReminders(hasNewReminder && !isRead('reminders'));
            setHasNewHealth(hasNewHealthRecord && !isRead('health'));
            setHasNewExpenses(hasNewExpense && !isRead('expenses'));
          }
        } catch (err) {
          console.error("Error fetching data for bell icon:", err);
          if (isMounted) {
            setHasNewReminders(false);
            setHasNewHealth(false);
            setHasNewExpenses(false);
          }
        }
      } else {
        if (isMounted) {
          setHasNewReminders(false);
          setHasNewHealth(false);
          setHasNewExpenses(false);
        }
      }
    };
    
    checkForNewData();
    
    if (user) {
      intervalId = setInterval(() => {
        checkForNewData();
      }, 30000);
      
      const handleFocus = () => {
        checkForNewData();
      };
      
      const handleDataRead = () => {
        checkForNewData();
      };
      
      window.addEventListener('focus', handleFocus);
      window.addEventListener('dataRead', handleDataRead);
      
      return () => {
        isMounted = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('dataRead', handleDataRead);
      };
    }
    
    return () => {
      isMounted = false;
    };
  }, [user, location.pathname]);

  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-3 bg-white shadow-sm top-0 z-50 sticky overflow-visible w-full">
      {/* Logo */}
      <div
        className="text-2xl font-bold text-[#29a980] text-[28px] cursor-pointer flex-shrink-0"
        onClick={() => navigate("/")}>
        PetCare+
      </div>

      {/* Navbar */}
      <nav className="hidden md:flex space-x-6 text-gray-700 text-[18px] flex-1 justify-center max-w-lg mx-4">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `transition duration-150 ease-in-out pb-1
             hover:text-[#29a980]
            ${
              isActive
                ? 'font-bold border-b-2 pb-[0] border-[#29a980] text-[#29a980]' // ACTIVE
                : 'font-normal border-b-2 pb-[0] border-transparent' // INACTIVE (border trong suốt để giữ chiều cao)
            }`
          }>
          Home
        </NavLink>
        <NavLink to="/intropage" className="hover:text-[#29a980]">
          About
        </NavLink>
        <NavLink to="/shops" className="hover:text-[#29a980]">
          Shop
        </NavLink>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-2 md:gap-4 relative flex-shrink-0 min-w-0">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-[#e8f7f0] rounded-[12px] w-[120px] md:w-[150px] px-[10px] md:px-[15px] py-[8px] md:py-[10px] border-none transition-all duration-300 ease-in-out 
                        hover:bg-[#d8f5e7] hover:shadow-md focus-within:bg-[#d8f5e7] focus-within:shadow-lg flex-shrink-0">
          <i className="fa-solid fa-magnifying-glass text-[#29a980] mr-[2px] text-sm"></i>
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent focus:outline-none text-xs md:text-sm w-[80px] md:w-[100px]"/>
        </div>

        {/* Notification */}
        <div 
          className="relative cursor-pointer z-10 flex-shrink-0" 
          onClick={() => navigate("/dashboard")}
        >
          <i
            className="fa-regular fa-bell text-[#29a980] bg-[#e8f7f0] p-2 md:p-3 rounded-[10px] transition duration-300 ease hover:bg-[#d8f5e7] text-sm md:text-base"
          ></i>
          {(hasNewReminders || hasNewHealth || hasNewExpenses) && (
            <span className="absolute top-0 right-0 h-2 w-2 md:h-2.5 md:w-2.5 bg-red-500 rounded-full animate-pulse border border-white"></span>
          )}
        </div>

        {/* Auth */}
        {!user ? (
          <button
            onClick={onLoginClick}
            className="px-3 md:px-[15px] py-2 md:py-[9px] rounded-[12px] font-bold text-xs md:text-[14px] bg-[#29a980] text-white hover:bg-[#1d926d] flex-shrink-0 whitespace-nowrap">
            Login
          </button>
        ) : (
          <div className="relative z-[60] flex-shrink-0" style={{ minWidth: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src={user.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email?.split("@")[0] || "User")}`}
              alt="User"
              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-green-500 cursor-pointer object-cover"
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'block', visibility: 'visible', opacity: 1, minWidth: '32px', minHeight: '32px', flexShrink: 0 }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email?.split("@")[0] || "User")}`;
              }}
            />

            {menuOpen && (
              <div className="absolute right-0 top-12 md:top-14 w-72 bg-white/90 backdrop-blur-md border border-gray-100 shadow-lg rounded-2xl p-3 z-[100]" style={{ display: 'block' }}>
                <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-3">
                  <img
                    src={user.avatar_url || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email?.split("@")[0] || "User")}`}
                    alt="Avatar"
                    className="w-11 h-11 rounded-full border border-green-200 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.full_name || user.email?.split("@")[0] || "User")}`;
                    }}/>
                  <div>
                    <p className="text-[15px] font-semibold text-gray-800 truncate">
                      {user.full_name
                        ? user.full_name
                        : user.email
                            ?.split("@")[0]
                            ?.replace(/\./g, " ")
                            ?.replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <i className="fa-solid fa-chart-simple text-green-500"></i>
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/orders");
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <i className="fa-solid fa-receipt text-green-500"></i>
                  <span>My Orders</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/account");
                    setMenuOpen(false);
                  }}
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-green-50 hover:text-green-600">
                  <i className="fa-solid fa-user-gear text-green-500"></i>
                  <span>Account Settings</span>
                </button>

                <button
                  onClick={logout}
                  className="flex items-center w-full gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 mt-2">
                  <i className="fa-solid fa-arrow-right-from-bracket"></i>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        )}
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
        <p>Your all-in-one platform for managing your pet's life and connecting with vets and products.</p>
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
    <p>Discover the features that make PetCare+ the ultimate platform for pet owners.</p>
    <a href="#" className="btn btn-secondary">Learn More</a>

    <div className="features-grid">
      <FeatureCard
        iconClass="fa-solid fa-paw"
        title="Pet Owner Features"
        description="Track health records, appointments, and care schedules with ease."/>
      <FeatureCard
        iconClass="fa-solid fa-heart-pulse"
        title="Health Tracking"
        description="Monitor your pet's health and wellness with comprehensive tracking tools."/>
      <FeatureCard
        iconClass="fa-solid fa-cart-shopping"
        title="Marketplace"
        description="Easily purchase a wide range of pet products from trusted sources."/>
    </div>
  </section>
);

const CareSection = () => (
  <section className="care-section">
    <h2>Find the Best Care for Your Pet</h2>
    <p>Connect with top-rated services to keep your pet happy and healthy.</p>
    <a href="#" className="btn btn-primary">Find Services</a>

    <div className="services-grid">
      <ServiceCard
        imageUrl={PLACEHOLDERS.GROOMING}
        altText="Grooming"
        title="Grooming"
        description="Connect with professional grooming services to keep your pet looking their best."/>
      <ServiceCard
        imageUrl={PLACEHOLDERS.WALKING}
        altText="Walking"
        title="Walking"
        description="Book professional walking services to ensure your pet gets the exercise they need."/>
      <ServiceCard
        imageUrl={PLACEHOLDERS.SITTING}
        altText="Sitting"
        title="Sitting"
        description="Find trusted pet sitting services for when you're away from home."/>
    </div>
  </section>
);

const SupportSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="support-section">
      <h2>Get Instant Support</h2>
      <p>Our AI chatbot is here to assist you with any questions or concerns you may have.</p>
      <button 
        onClick={() => navigate("/ai-chat")} 
        className="btn btn-primary"
      >
        Chat with AI
      </button>

      <div className="support-grid">
        <SupportCard
          iconClass="fa-solid fa-robot"
          title="AI Chatbot"
          description="Get quick answers to your questions about pet care, products, and services."/>
        <SupportCard
          iconClass="fa-solid fa-circle-info"
          title="Help Center"
          description="Access our comprehensive help center for detailed information and guides."/>
      </div>
    </section>
  );
};

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

// --- Main App Component ---

const HomePage = () => {
  const navigate = useNavigate(); 
  const [showLogin, setShowLogin] = useState(false);

  const handleCloseModal = () => {
    setShowLogin(false);
  };
  return (
    <>
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"/>
      <style>{CSS_STYLES}</style>

      <div className="container relative">
        {/* Header truyền hàm mở modal */}
        <Header onLoginClick={() => setShowLogin(true)} />

        <main className="content">
          <HeroSection />
          <ExploreSection />
          <CareSection />
          <SupportSection />
        </main>

        <Footer />

      

{/* Login Modal - No role selection needed */}
{showLogin && (
  <LoginForm onClose={handleCloseModal} />
)}
      </div>
    </>
  );
};

export default HomePage;