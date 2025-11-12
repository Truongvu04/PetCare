import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js"; 
import {
  Home,
  PawPrint,
  ChevronDown,
  Search,
  Bell,
  Heart,
  DollarSign,
  Calendar,
  ShoppingBag,
  Settings,
} from "lucide-react";

const Shop = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 👈 Lấy user
  const products = [
    {
      name: "Premium Dog Food",
      desc: "High-quality nutrition for your dog",
      img: "https://images.unsplash.com/photo-1601758124513-241c2b3b4dba",
    },
    {
      name: "Organic Dog Treats",
      desc: "Healthy and delicious treats",
      img: "https://images.unsplash.com/photo-1589927986089-35812388d1b3",
    },
    {
      name: "Dog Leash",
      desc: "Durable and stylish leash",
      img: "https://images.unsplash.com/photo-1620331311521-2b31d44640ee",
    },
    {
      name: "Dog Toy",
      desc: "Interactive toy for your dog",
      img: "https://images.unsplash.com/photo-1560807707-8cc77767d783",
    },
    {
      name: "Dog Shampoo",
      desc: "Gentle and effective shampoo",
      img: "https://images.unsplash.com/photo-1599312691291-8aa9b6fce9f3",
    },
    {
      name: "Dog Bed",
      desc: "Comfortable bed for your dog",
      img: "https://images.unsplash.com/photo-1619983081563-430f636027b1",
    },
    {
      name: "Dog Collar",
      desc: "Adjustable and safe collar",
      img: "https://images.unsplash.com/photo-1574158622682-e40e69881006",
    },
    {
      name: "Dog Bowl",
      desc: "Non-slip bowl for food and water",
      img: "https://images.unsplash.com/photo-1625758479638-406f0f7f0b84",
    },
    {
      name: "Dog Training Book",
      desc: "Guide to training your dog",
      img: "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
    },
    {
      name: "Dog Carrier",
      desc: "Safe and comfortable carrier",
      img: "https://images.unsplash.com/photo-1555685812-84b7f642b7a3",
    },
  ];

  return (
    <div className="flex bg-gray-50 min-h-screen justify-center">
      <div className="flex w-full max-w-[1280px]">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm p-6 border-r border-gray-100">
          <div className="flex items-center space-x-3 mb-8">
            <img
              src={user?.avatar_url || "https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg"}
              alt="Profile"
              onClick={() => navigate("/")}
              className="w-10 h-10 rounded-full object-cover cursor-pointer hover:ring-2 hover:ring-green-400 transition"/>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.full_name || "Emily Carter"}</h3>
              {/* <span className="owner font-semibold text-gray-900">{user?.role || "Owner"}</span> */}
            </div>
          </div>

          <nav className="flex flex-col space-y-2">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <Home size={18} /> Dashboard
            </button>
            <div className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <PawPrint size={18} /> My Pets
            </div>
            <button
              onClick={() => navigate("/reminder")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <Bell size={18} /> Reminders
            </button>
            <button
              onClick={() => navigate("/health")}
              className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <Heart size={18} /> Health & Activity
            </button>
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <DollarSign size={18} /> Expenses
            </button>
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <Calendar size={18} /> Calendar
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 text-green-800 font-semibold">
              <ShoppingBag size={18} /> Shop
            </button>
            <button className="text-gray-700 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 w-full text-left transition">
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 py-6">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative w-full max-w-xl">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full rounded-full border border-gray-200 pl-12 pr-10 py-3 focus:ring-1 focus:ring-green-500 focus:outline-none"
              />
              <Search
                className="absolute left-4 top-3 text-gray-400 mt-[2px]"
                size={20}
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Results</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {["Dog", "Cat", "Bird", "Fish", "Reptile"].map((cat) => (
                <button
                  key={cat}
                  className="bg-green-50 text-green-700 border border-green-100 px-4 py-1.5 rounded-full text-sm hover:bg-green-100"
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
              {["Sort: Recommended", "Price", "Rating", "Delivery"].map((filter) => (
                <button
                  key={filter}
                  className="bg-green-50 text-green-700 border border-green-100 px-4 py-1.5 rounded-full text-sm flex items-center gap-1 hover:bg-green-100">
                  {filter} <ChevronDown size={18} className="text-gray-500" />
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-5 gap-6">
            {products.map((p, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm hover:shadow-md transition p-3">
                <img
                  src={p.img}
                  alt={p.name}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
                <h3 className="font-medium text-gray-800">{p.name}</h3>
                <p className="text-sm text-green-600">{p.desc}</p>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 space-x-3 text-sm">
            <button className="text-gray-400 hover:text-gray-600">‹</button>
            <button className="text-green-700 font-semibold">1</button>
            <button className="text-gray-500 hover:text-green-600">2</button>
            <button className="text-gray-500 hover:text-green-600">3</button>
            <button className="text-gray-500 hover:text-green-600">›</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
