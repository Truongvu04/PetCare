export const pets = [
  {
    id: "255e1dc40759",
    name: "Buddy",
    type: "Dog",
    breed: "Golden Retriever",
    age: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-2_6X5_WxPsQUBevckgkleP7ZnuNBYrUidwV51VHOcd9zwD8375RFa4aA63WYowBEl91osCLWGVEFVfGJuQmuApIVHa6hEXPf7ZsFOXOYQEoS8HENKx847fzSC23emA-L4lG2GZAZImTkl0iTCl7BzsFT-tKVhHYjrpUWFIGe7JHOPrjsx2dyxieLXEvntnbdyRkhPSK-zXsCMhxIFOg-KLnapWrluAhpQhOGI_UGB3ExWV7_AQjQhccOYmaWu9jS_Fg23Ic98n4l",
    weight: "25 lbs",
    diet: "Balanced Plan"
  },
  {
    id: "96c8d958935f",
    name: "Whiskers",
    type: "Cat",
    breed: "Siamese",
    age: 5,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgfp7B0XSacgRiNYeuXx5xe8kBpphfE5BSSjpe0_md3qXwPVtTUvjqNCB5HJDIWp5PitjYeGhZoDcrvxnvhGCz6nWfIQoKTFcnrWrA_A-0H09iSPjrAiidWWeboJW1bE5GosYRW313PhXU2cOyipVtJEBTWa-r_5apUTVpJCEXNlYdKTTuh_X6YG3IScUYzPmfnq7P78izel4jwewvoI0l1ndBIeFnj2wDjSChksWScq57wsfj8eXdihS5goqRX8zUfVf8Rsg-FbGB",
    weight: "12 lbs",
    diet: "Indoor Cat Formula"
  },
  {
    id: "c8866be165fc",
    name: "Chirpy",
    type: "Bird",
    breed: "Parakeet",
    age: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhDVtaUaz_r575_N5DcIRYOvkWjkKCby7rtdQoBRdSFYpnjCCT-Zvh2kWmokj_Y7qiTc9NO3INBtV5Qo2arSDnnkcOc1sH2A5_ugSvUf7V1rhcyOIt2Lk1I0i13Q58oZgD4RATb5_MszPPaFA4GVCfxJ9q5ob5FUlfypD_VF55oXSwvPz1TuLer1m_PQ9EJ-suEvrHWoOi9wZeJjNkUr5xWq92zyBPmXFMBThX7kREFp6jXCdl-09Dh9CsQ7fe3-TMZita04B83sw5",
    weight: "0.5 lbs",
    diet: "Seed Mix"
  }
];

export const reminders = [
  {
    reminder_id: 1,
    pet_id:"255e1dc40759",
    name: "Buddy",
    type: "vaccination",
    title: "Vaccination for Fido",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    status: "upcoming",
    icon: "vaccines"
  },
  {
    reminder_id: 2,
    pet_id: "96c8d958935f",
    name: "Whiskers",
    type: "checkup",
    title: "Regular Check-up for Whiskers",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    status: "upcoming",
    icon: "health_and_safety"
  },
  {
    reminder_id: 3,
    pet_id: "255e1dc40759",
    name: "Buddy",
    type: "feeding",
    title: "Feeding Schedule for Fido",
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    status: "upcoming",
    icon: "restaurant"
  },
  {
    reminder_id: 4,
    pet_id: "96c8d958935f",
    name: "Whiskers",
    type: "grooming",
    title: "Grooming Appointment for Whiskers",
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: "overdue",
    icon: "cut"
  }
];

export const expenses = [
  {
    id: 1,
    category: "Food",
    amount: 50,
    month: "current",
    icon: "shopping_cart"
  },
  {
    id: 2,
    category: "Medicine",
    amount: 20,
    month: "current",
    icon: "medication"
  }
];

export const vetClinics = [
  {
    id: 1,
    name: "Happy Paws Veterinary Clinic",
    address: "123 Wellness Way, Petville, CA 90210",
    rating: 4.9,
    reviews: 234,
    status: "Open until 9:00 PM",
    coordinates: { lat: 34.0522, lng: -118.2437 }
  }
];

export const user = {
  user_id: 1,
  full_name: "Sarah",
  email:"Something@gmail.com",
  role: "Owner",
  avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHuNyAbMF4mGjcrjf2PQ0T4V2nnvTwub7wlCiRtqB7uPRa3posUBrHCeDHkj6kefkk_SHHf-RZ35atzTIPbYZdxxXfz4HwyVtqmaYLvlEFDmxRcLN-2SMJGrxnm_mFPQpZlHAkq2MR2ER40eDJZS2WmuDr6TsAHCZNZnVfGNr6Mt2VC-UMrhzzAPY8AeRQ4hUJ5JKD98rSZcXxNr89zjmHZJJGEKteg1auRERfS5DAsljwL-zPm6EC7yuE2cSB4gGypYjt5ZRxtUsU"
};
