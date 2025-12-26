import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Search } from "lucide-react";

const IntroPage = () => {
const navigate = useNavigate();  
  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800">
      {/* HEADER */}
      <header className="w-[1304px] py-0 px-[12px]">
        <div className="flex items-center justify-between px-8 py-3 bg-white shadow-sm sticky top-0 z-50">
          {/* Left - Logo + Nav */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-[#29a980] text-[28px] cursor-pointer">PetCare+</h1>
            <nav className="flex space-x-6 text-gray-700 text-[18px] ml-[50px]">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"}> 
                  Home 
              </NavLink>

              <NavLink
                to="#"
                  className={({ isActive }) =>
                    `transition duration-150 ease-in-out pb-1
                    hover:text-[#29a980]
                    ${
                      isActive
                        ? 'font-semibold border-b-2 pb-[0] border-[#29a980] text-[#29a980]' // ACTIVE
                        : 'font-normal border-b-2 pb-[0] border-transparent' // INACTIVE (border trong suốt để giữ chiều cao)
                    }`
                  }>
                  About
              </NavLink>

              <NavLink
                to="/shops"
                className={({ isActive }) =>
                  `hover:text-green-600 ${
                    isActive ? "text-[#29a980] font-semibold" : ""
                  }`
                }>
                Shop
              </NavLink>
            </nav>
          </div>

          {/* Right - Search, Notification, Profile */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-[#e8f7f0] rounded-[12px] w-[150px] px-[15px] py-[8px] w-[150px] border-none transition-all duration-300 ease-in-out 
                        hover:bg-[#d8f5e7] hover:shadow-md focus-within:bg-[#d8f5e7] focus-within:shadow-lg">
              <Search className="text-[#29a980] mr-[2px] hover:text-green-600" />
              <input
                type="text"
                placeholder="Search"
                className="bg-transparent focus:outline-none text-sm w-[100px]"/>
            </div>
            <button className="text-[#29a980] bg-[#e8f7f0] p-2 md:p-3 rounded-[10px] transition duration-300 ease hover:bg-[#d8f5e7] text-sm md:text-base">
              <Bell className="w-4 h-4 text-green-600" 
              onClick={() => navigate("/dashboard")}/>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1280px] w-full bg-white shadow-sm px-[30px] py-[30px]">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] rounded-[15px] overflow-hidden bg-gray-100 mb-10">
          <img
            src="src/image/About.jpg"
            alt="PetCare Hero"
            className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white px-6">
            <h1 className="text-[3.5em] text-[#d3fff6] font-bold mb-2">We’re Here to Help</h1>
            <p className="max-w-[60rem] text-[1.1em] text-[#d3fff6]">
              PetCare+ is a comprehensive pet care management platform designed to support pet owners, 
              service providers, and administrators in delivering safer, smarter, and more efficient pet care experiences.
            </p>
            <button className="mt-4 bg-[#29a980] hover:bg-[#1d926dff] text-white font-semibold px-[25px] py-[10px] rounded-[12px] text-[18px]">
              Contact Us
            </button>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Introducing PetCare+
          </h2>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            PetCare+ is a comprehensive pet care and veterinary management system designed to simplify how pet owners manage their pets’ health and daily needs. 
            The platform serves as a centralized solution that allows users to store pet profiles, track health records, manage expenses, receive smart reminders, 
            and connect with trusted veterinary clinics and service providers.
          </p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            By combining modern web technologies with intelligent features such as AI-assisted consultation and data-driven recommendations, 
            PetCare+ aims to reduce the complexity of pet care management while improving the overall quality of life for pets and their owners.
          </p>
        </section>
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Our Mission & Vision
          </h2>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            🎯 Our Mission:
            Our mission is to empower pet owners with a reliable and user-friendly digital platform that helps them manage pet health, 
            prevent medical risks, and access trusted veterinary services efficiently. PetCare+ strives to make responsible pet care easier, 
            smarter, and more accessible for everyone.
          </p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            🌍 Our Vision:
            Our vision is to become a trusted digital companion for pet owners by building a connected ecosystem that bridges the gap between pet owners, 
            veterinary professionals, and service providers—ensuring healthier and happier lives for pets worldwide.
          </p>
        </section>
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            What We Offer (Core Features)</h2>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            1. Pet Profile Management:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Create and manage detailed profiles for each pet, including breed, age, medical history, and special notes.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            2. Health Records & Vaccination Tracking:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Store medical records, vaccination schedules, and treatment histories in one secure place.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            3. Smart Reminders & Notifications:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Receive automated reminders for vaccinations, medical check-ups, grooming schedules, and important events.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            4. Expense & Activity Tracking:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Monitor pet-related expenses and daily activities to better manage care routines and budgets.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            5. Marketplace for Products & Services:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Browse and purchase pet products and services from verified vendors through an integrated marketplace.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            6. Veterinary Clinic Locator:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Discover nearby veterinary clinics and service providers through an interactive map.</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            7. AI Chatbot Consultation:</p>
          <p className="max-w-4xl mx-auto text-gray-600 text-justify leading-relaxed">
            Get instant guidance and basic health insights through an AI-powered chatbot (non-diagnostic support).</p>
        </section>
        <section className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Who Is PetCare+ For?
          </h2>
          <div className="flex justify-between px-[70px]">
            <p className="max-w-[350px] text-gray-600 text-left leading-relaxed ">
              <p className="font-semibold">👤 Pet Owners</p>
              <p>Manage pet profiles and medical histories,</p>
              <p>Receive timely health reminders,</p>
              <p>Track expenses and daily activities,</p>
              <p>Find trusted veterinary services and products,</p>
              <p>Access AI-powered guidance for common pet care concerns.</p>
            </p>
            
            <p className="max-w-[350px] text-gray-600 text-left leading-relaxed">
              <p className="font-semibold">🏪 Vendors (Service & Product Providers)</p>
              <p>Manage product and service listings,</p>
              <p>Track orders and sales performance,</p>
              <p>Create promotions and discount coupons,</p>
              <p>Receive customer feedback and ratings,</p>
              <p>Analyze sales data through built-in analytics.</p>
            </p>
            <p className="max-w-[350px] text-gray-600 text-left leading-relaxed">
              <p className="font-semibold">🛠️ System Administrators</p>
              <p>Managing users and vendor accounts,</p>
              <p>Approving products and services,</p>
              <p>Monitoring system activity and reports,</p>
              <p>Managing platform-wide coupons and policies,</p>
              <p>Ensuring system security and compliance.</p>
            </p>
          </div>
        </section>
        

        {/* Our Team */}
        <section className="text-center">
          <h3 className="text-xl font-semibold mb-8 text-gray-800">
            Development Team
          </h3>
          <div className="flex justify-center gap-12">
            {[
              {
                name: "Truong Vu",
                role: "Scrum Master",
                img: "src/image/Vu.jpg",
              },
              {
                name: "Cam Van",
                role: "Tester",
                img: "src/image/Van.jpg",
              },
              {
                name: "Ham Duy",
                role: "Developer",
                img: "src/image/Duy.jpg",
              },
              {
                name: "Khai Huy",
                role: "Developer",
                img: "src/image/Huy.jpg",
              },
              {
                name: "Minh Chien",
                role: "Tester",
                img: "src/image/Chien.jpg",
              },
            ].map((member) => (
              <div key={member.name}>
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-32 h-32 object-cover rounded-full mx-auto mb-3 border border-gray-200"/>
                <h4 className="font-semibold text-gray-800">{member.name}</h4>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default IntroPage;
