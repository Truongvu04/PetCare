import React from "react";
import { Star, ThumbsUp, MessageCircle, ShoppingCart } from "lucide-react";

const ProductDetail = () => {
  return (
    <div className="max-w-[1280px] mx-auto p-8">
      {/* Breadcrumb */}
      <div className="text-sm text-green-700 mb-4">
        Marketplace / <span className="text-gray-500">Toys</span>
      </div>

      {/* Title & Description */}
      <h1 className="text-2xl font-semibold mb-3">
        Interactive Cat Toy with Feather
      </h1>
      <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl">
        Engage your feline friend with this interactive toy, featuring a soft
        feather attachment that mimics natural prey movements. Made with
        durable, pet-safe materials, it’s designed to provide hours of
        entertainment and exercise for cats of all ages.
      </p>

      {/* Product Image */}
      <div className="rounded-xl overflow-hidden mb-8">
        <img
          src="https://images.unsplash.com/photo-1601758063548-0f0b7be0e33d"
          alt="Cat Toy"
          className="w-full object-cover"
        />
      </div>

      {/* Product Details */}
      <div className="border-t pt-6 mb-10">
        <h2 className="text-lg font-semibold mb-4">Product Details</h2>
        <div className="grid grid-cols-3 gap-6 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-800">Material</p>
            <p>Non-toxic plastic, feather</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Dimensions</p>
            <p>10 x 2 x 2 inches</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">Weight</p>
            <p>0.2 lbs</p>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Reviews</h2>

        {/* Average Rating */}
        <div className="flex items-center gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold">4.5</p>
            <div className="flex justify-center mb-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={16}
                  className={i <= 4 ? "text-green-600 fill-green-600" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">120 reviews</p>
          </div>

          {/* Rating Bars */}
          <div className="flex-1 space-y-2">
            {[5, 4, 3, 2, 1].map((star, i) => {
              const percentages = [40, 30, 15, 7, 8];
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="w-4 text-sm text-gray-600">{star}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full"
                      style={{ width: `${percentages[i]}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 w-10 text-right">
                    {percentages[i]}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Individual Reviews */}
        <div className="space-y-8">
          {/* Review 1 */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://randomuser.me/api/portraits/women/44.jpg"
                alt="user"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">Sophia Clark</p>
                <p className="text-sm text-gray-500">2 weeks ago</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={i <= 5 ? "text-green-600 fill-green-600" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              My cat absolutely loves this toy! It keeps her entertained for
              hours, and I love that it’s made with safe materials. Highly
              recommend!
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-green-600">
                <ThumbsUp size={14} /> 15
              </button>
              <button className="flex items-center gap-1 hover:text-green-600">
                <MessageCircle size={14} /> 2
              </button>
            </div>
          </div>

          {/* Review 2 */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://randomuser.me/api/portraits/men/32.jpg"
                alt="user"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium">Liam Carter</p>
                <p className="text-sm text-gray-500">1 month ago</p>
              </div>
            </div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={i <= 4 ? "text-green-600 fill-green-600" : "text-gray-300"}
                />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">
              Good quality toy, my cat enjoys playing with it. The feather is a
              bit delicate, but overall a great product.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <button className="flex items-center gap-1 hover:text-green-600">
                <ThumbsUp size={14} /> 9
              </button>
              <button className="flex items-center gap-1 hover:text-green-600">
                <MessageCircle size={14} /> 1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="mt-10 flex justify-end">
        <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-full hover:bg-green-700 transition-all">
          <ShoppingCart size={18} /> Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductDetail;
