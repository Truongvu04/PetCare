import React from "react";
import { NavLink } from "react-router-dom";
import { Bell, Search } from "lucide-react";

const IntroPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center bg-white text-gray-800">
      {/* HEADER */}
      <header className="w-[1280px] py-0 px-[12px]">
        <div className="flex items-center justify-between px-8 py-3 bg-white shadow-sm sticky top-0 z-50">
          {/* Left - Logo + Nav */}
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-[#29a980] text-[28px] cursor-pointer">PetCare+</h1>
            <nav className="flex space-x-6 text-gray-700 text-[18px] ml-[50px]">
              <NavLink 
                to="/" 
                className={({ isActive }) => 
                  isActive ? "nav-link active" : "nav-link"}> 
                  Trang chủ 
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
                Giới thiệu
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
                placeholder="Tìm kiếm"
                className="bg-transparent focus:outline-none text-sm w-[100px]"/>
            </div>
            <button className="p-2 rounded-full hover:bg-green-50">
              <Bell className="w-5 h-5 text-green-600" />
            </button>
            <img
              src="https://i.pinimg.com/564x/b4/fd/3e/b4fd3e4a93836c4eac49a30728d3d6c5.jpg"
              alt="Profile"
              className="w-9 h-9 rounded-full border border-gray-200"/>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-[1280px] w-full px-6 py-10">
        {/* Hero Section */}
        <section className="relative w-full h-[380px] rounded-xl overflow-hidden bg-gray-100 mb-10">
          <img
            src="https://i.pinimg.com/736x/68/10/2e/68102e59b734e078ffb02475b2e4d802.jpg"
            alt="PetCare Hero"
            className="w-full h-full object-cover"/>
          <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-center text-white px-6">
            <h2 className="text-3xl font-bold mb-2">We’re Here to Help</h2>
            <p className="max-w-md text-sm text-gray-200">
              At PetCare+, we’re committed to keeping your pets happy and
              healthy. Explore how we assist you and your furry friends every
              step of the way.
            </p>
            <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-full">
              Contact Us
            </button>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="text-center mb-16">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Giới thiệu về PetCare+
          </h2>
          <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
            PetCare+ là hệ thống quản lý và chăm sóc thú cưng toàn diện dành cho
            chủ nuôi, nhà cung cấp dịch vụ và quản trị viên. Nền tảng giúp bạn
            theo dõi hồ sơ sức khỏe, chi tiêu, lịch tiêm chủng, đồng thời kết nối
            với các cửa hàng và phòng khám thú y uy tín. Với PetCare+, bạn có
            thể yên tâm rằng người bạn nhỏ của mình luôn được chăm sóc chu đáo
            và an toàn.
          </p>
        </section>

        {/* Our Team */}
        <section className="text-center">
          <h3 className="text-xl font-semibold mb-8 text-gray-800">
            Đội ngũ phát triển
          </h3>
          <div className="flex justify-center gap-12">
            {[
              {
                name: "Emily Carter",
                role: "CEO",
                img: "https://i.pinimg.com/564x/89/2b/7c/892b7cc9632f8e09075b4a8196c935cf.jpg",
              },
              {
                name: "David Lee",
                role: "Head of Product",
                img: "https://i.pinimg.com/564x/2b/4e/3a/2b4e3a4109377b27c4b86b9fa286d214.jpg",
              },
              {
                name: "Sophia Rodriguez",
                role: "Lead Developer",
                img: "https://i.pinimg.com/564x/30/9f/8a/309f8a63a32ebd25ab72f872bb44ee38.jpg",
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
