import React from 'react';

const HomePage = () => {
  return React.createElement('div', null,
    React.createElement('section', { className: 'relative' },
      React.createElement('div', {
        className: 'absolute inset-0 bg-cover bg-center',
        style: {
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCMVBYifwPscVZfLU8I-elfJPv-WCb_KdhkaEAt2P9PEkTvgA3S3hbyT7vCMri0TFUJPKWsjNVXfogBIlwlqxQi2ftJocADxAAhFuyuTXrPflwu1VJr4haWQcTND7WDopwp_7cUOAqxnnZnEY_NBFj9jpbpic0AzyzON5gcEKcPQJDVzt8BdUrRHiTFgfT59fVL7FetfTiHm2-fKVhckXcRlOiAEZEBbdomYINIkZpTZWY4X3x7LH5KwCiPHHVY9QwGQfFpr4FqXY6o")'
        }
      }),
      React.createElement('div', { className: 'relative container mx-auto px-4 sm:px-6 lg:px-8 py-32 sm:py-48 text-center text-white' },
        React.createElement('h1', { className: 'text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter' }, 'Welcome to PetCare+'),
        React.createElement('p', { className: 'mt-4 max-w-3xl mx-auto text-base sm:text-lg text-background-light/80' }, 
          'Your all-in-one platform for pet care, connecting owners with trusted vendors, veterinary services, and AI-powered assistance.'
        ),
        React.createElement('div', { className: 'mt-8 flex justify-center' },
          React.createElement('button', {
            className: 'bg-primary text-background-dark font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors text-base sm:text-lg'
          }, 'Get Started')
        )
      )
    ),
    
    React.createElement('section', { className: 'py-16 sm:py-24' },
      React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'text-center mb-12' },
          React.createElement('h2', {
            className: 'text-3xl sm:text-4xl font-extrabold text-background-dark dark:text-background-light tracking-tight'
          }, 'Featured Video')
        ),
        React.createElement('div', {
          className: 'relative flex items-center justify-center bg-background-dark bg-cover bg-center aspect-video rounded-xl shadow-lg',
          style: {
            backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvdacSQ1KfdJEYp9wnw6hiYalugt9U_WvYkPMn_cu7F8FxJgX8lAvUBd1D7AyEQIDY3OfZTE6F0zCoLzJLIUgNs7lQiCbguFnt5CG0GDf1ssqgyIdkKQQylYwHn8wOQ42oZZrkNGaevIwkGi_9cAjx7w3YwRGiWrPkiQzRpKvnbmHKlaYjdC-2REwP3RpyTfxwpF3ZSD_luUJB_RcJvyv4WYObHEjl_92cU3xLrmA3d_dFFGFav3GLMj3v3g0rxu_EoUrcJ2suxm2s")'
          }
        },
          React.createElement('button', {
            className: 'flex shrink-0 items-center justify-center rounded-full size-20 bg-black/50 text-white hover:bg-black/70 transition-colors'
          },
            React.createElement('span', { className: 'material-symbols-outlined text-5xl !leading-none' }, 'play_arrow')
          )
        )
      )
    ),
    
    React.createElement('section', { className: 'bg-background-dark/5 dark:bg-background-light/5 py-16 sm:py-24' },
      React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'max-w-3xl mx-auto text-center mb-12' },
          React.createElement('h2', {
            className: 'text-3xl sm:text-4xl font-extrabold text-background-dark dark:text-background-light tracking-tight'
          }, 'Your Pet\'s Well-being, Simplified'),
          React.createElement('p', { className: 'mt-4 text-base sm:text-lg text-background-dark/60 dark:text-background-light/60' },
            'Discover a range of services and features designed to enhance your pet care experience.'
          )
        ),
        React.createElement('div', { className: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8' },
          React.createElement('div', {
            className: 'flex flex-col gap-4 bg-background-light dark:bg-background-dark p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow'
          },
            React.createElement('div', {
              className: 'w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg',
              style: {
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBmEpUgYQlN3cCz0t42QZ20qirf_z2e0T7e_lmjBx8mBSFqT4FXy4SIDT9BLSdS7Is7KYUnU9lNDAkmI1QWzLnvsUX0j5pdXNAZLjD_1aj18PBxGQR9GqO7OtzWoNTtgeFBtKy4FWbpByFiIh3wMWkpxWRmkLiZtIj_NdYlWNtKUNHguyAZCmksOK5WydbKJrmbiFbaPEACp6HSWxu7L5v11aH0kXg1n7QkSlz0FmHGMpS-Keljh2B5PiJWlba4h0OKmkdcUWa3ffJa")'
              }
            }),
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-lg font-bold text-background-dark dark:text-background-light' }, 'Marketplace'),
              React.createElement('p', { className: 'text-sm text-background-dark/60 dark:text-background-light/60 mt-1' },
                'Shop for high-quality pet supplies, food, and accessories from trusted vendors.'
              )
            )
          ),
          React.createElement('div', {
            className: 'flex flex-col gap-4 bg-background-light dark:bg-background-dark p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow'
          },
            React.createElement('div', {
              className: 'w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg',
              style: {
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBkY6LV_-oCfMVB8iKRQdCx6S0HvL7x5jU4jwcEL6RpehX7rzeZW2ESNMIH67vvweNJNag4c2zPF5ehHuwhpIWRuDsOS_Ms0CnHVJxtLIQmQSk7PU8MxTQg_TJ_yx94thilJHuUHgDet0Kbb-dHTT4PU0390EQ66sx0C2SZz7bkTXrh5bgP-IZkrbDet71O9WN1YyC6Ru22syQ9InhTC0pyR8xsGWdneFE7IlcPdZCSxYuhqmMQCJgeVWdVEsNwhzPRs-lJw6VEq8cL")'
              }
            }),
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-lg font-bold text-background-dark dark:text-background-light' }, 'Veterinary Map'),
              React.createElement('p', { className: 'text-sm text-background-dark/60 dark:text-background-light/60 mt-1' },
                'Find and connect with top-rated veterinary clinics and professionals in your area.'
              )
            )
          ),
          React.createElement('div', {
            className: 'flex flex-col gap-4 bg-background-light dark:bg-background-dark p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow'
          },
            React.createElement('div', {
              className: 'w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg',
              style: {
                backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDabf2wQqoIH8I3vFQo9wUXU14ICd77dQ9iyBeN7PbEEQg-XKIp0Jms4k6nU6xldXZqSWZgsCZcpjOtfSCZTzoJM3yaS3ccykcb-dd-GAzwi_-hfmMdQ7SncQ5rfFlElfVAdJxyJUt3d3cEEQ_u3-BAwej7ziZEy0oseT11PmcK-qELvQ_3XkueSmLJjOuhBQJCmtnmQJeJ6b1ShfRxVs3vcO_l7JGddfX7IWdlu-uGhief3EEgAtsGoa0nOexaZ5D-1e4ViTzEXeQE")'
              }
            }),
            React.createElement('div', null,
              React.createElement('h3', { className: 'text-lg font-bold text-background-dark dark:text-background-light' }, 'AI Chatbot'),
              React.createElement('p', { className: 'text-sm text-background-dark/60 dark:text-background-light/60 mt-1' },
                'Get instant answers to your pet care questions and personalized advice from our AI assistant.'
              )
            )
          )
        )
      )
    ),
    
    React.createElement('section', { className: 'py-16 sm:py-24' },
      React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center' },
        React.createElement('h2', {
          className: 'text-3xl sm:text-4xl font-extrabold text-background-dark dark:text-background-light tracking-tight'
        }, 'Our Mission'),
        React.createElement('p', { className: 'mt-4 text-base sm:text-lg text-background-dark/60 dark:text-background-light/60' },
          'At PetCare+, we\'re dedicated to improving the lives of pets and their owners. Our platform provides a seamless and supportive environment for all your pet care needs, from finding the best products to accessing expert advice and building a community of fellow pet lovers.'
        )
      )
    ),
    
    React.createElement('section', { className: 'py-16 sm:py-24' },
      React.createElement('div', { className: 'container mx-auto px-4 sm:px-6 lg:px-8 text-center' },
        React.createElement('h2', {
          className: 'text-3xl sm:text-4xl font-extrabold text-background-dark dark:text-background-light tracking-tight max-w-2xl mx-auto'
        }, 'Ready to Elevate Your Pet Care Journey?'),
        React.createElement('p', {
          className: 'mt-4 text-base sm:text-lg text-background-dark/60 dark:text-background-light/60 max-w-2xl mx-auto'
        }, 'Sign up now and experience the convenience and support of PetCare+.'),
        React.createElement('div', { className: 'mt-8' },
          React.createElement('button', {
            className: 'bg-primary text-background-dark font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors text-base sm:text-lg'
          }, 'Join PetCare+ Today')
        )
      )
    )
  );
};

export default HomePage;
