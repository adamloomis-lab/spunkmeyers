/*
 * DESIGN: Cinematic Editorial - Dark magazine spread
 * Tabbed menu with dark cards, orange category headers, GF/SPX badges
 */
import { useState, useRef, useEffect } from "react";
import { IMAGES, LINKS } from "@/lib/constants";
import SEO, { menuSchema, breadcrumbSchema } from "@/components/SEO";

interface MenuItem {
  name: string;
  price: string;
  desc: string;
  gf?: boolean;
  spx?: boolean;
  topSeller?: boolean;
}

interface MenuCategory {
  id: string;
  label: string;
  note?: string;
  items: MenuItem[];
}

const menuData: MenuCategory[] = [
  {
    id: "wings",
    label: "Wings",
    note: "Served with celery and choice of ranch or blue cheese and one sauce per order. $1 additional sauces per order.",
    items: [
      { name: "8 Boneless", price: "$9", desc: "" },
      { name: "12 Boneless", price: "$11", desc: "" },
      { name: "6 Traditional Wings", price: "$9", desc: "", gf: true },
      { name: "12 Traditional Wings", price: "$16", desc: "", gf: true },
    ],
  },
  {
    id: "sauces",
    label: "Sauces & Rubs",
    items: [
      { name: "Death By Wing (Extreme Hot)", price: "", desc: "", spx: true },
      { name: "Hot Buffalo", price: "", desc: "", spx: true },
      { name: "Nashville Hot", price: "", desc: "" },
      { name: "Spunks Garlic Hot", price: "", desc: "" },
      { name: "Hot Honey Garlic", price: "", desc: "", spx: true },
      { name: "Spicy BBQ", price: "", desc: "", spx: true },
      { name: "Jalapeno Ranch", price: "", desc: "" },
      { name: "Sriracha Bourbon", price: "", desc: "" },
      { name: "Chipotle Ranch", price: "", desc: "" },
      { name: "Medium", price: "", desc: "", spx: true },
      { name: "Mild", price: "", desc: "", spx: true },
      { name: "Mango Habanero", price: "", desc: "" },
      { name: "Gochujang Korean Pepper", price: "", desc: "" },
      { name: "Sweet Chili", price: "", desc: "" },
      { name: "BBQ", price: "", desc: "" },
      { name: "Honey BBQ", price: "", desc: "", spx: true },
      { name: "Honey Mustard", price: "", desc: "" },
      { name: "Garlic Parmesan", price: "", desc: "" },
      { name: "Sesame Ginger", price: "", desc: "", spx: true },
      { name: "Teriyaki", price: "", desc: "" },
      { name: "Bacon Aioli", price: "", desc: "" },
    ],
  },
  {
    id: "starters",
    label: "Starters",
    items: [
      { name: "Stuffed Mushrooms", price: "$11", desc: "House made stuffed mushrooms with shrimp, cream cheese, jalapeno and topped w/melted Mozzarella", gf: true, spx: true },
      { name: "Fried Green Beans", price: "$9", desc: "Lightly breaded green beans served with cucumber wasabi ranch for dipping" },
      { name: "Beer Battered Cheese Curds", price: "$9", desc: "White Cheddar cheese, beer battered and fried golden. Served with choice of marinara sauce or Chipotle Ranch" },
      { name: "Buffalo Chicken Dip", price: "$10", desc: "Home made creamy Buffalo chicken dip served with side of tortilla chips", gf: true },
      { name: "Loaded Potato Skins", price: "$10", desc: "House made loaded potato skin cups with Monterey jack, Cheddar cheese, bacon, green onions and a side of sour cream. Add chili $3 Add chicken $4", gf: true },
      { name: "Fried Pickle Chips", price: "$9", desc: "Golden fried dill pickles, side of ranch" },
      { name: "Colossal Bavarian Pretzel", price: "$11", desc: "A colossal sized baked fresh soft pretzel, with honey mustard and beer cheese dipping sauces. Trust us it's HUGE!" },
      { name: "Hot Pepper Cheese Bites", price: "$9", desc: "Melted Jack cheeses with spicy jalapeno pieces fried golden" },
      { name: "Sauerkraut Balls", price: "$9", desc: "Crispy, golden sauerkraut balls filled with hints of sausage and cream cheese. Served with 1000 Island or honey mustard" },
      { name: "Reuben Egg Rolls", price: "$12", desc: "Corned beef, cheese and sauerkraut fried golden and served with 1000 Island sauce" },
      { name: "Gameday Nachos", price: "$10", desc: "Tortilla chips layered with beer cheese, house pico, jalapenos, green onions, side of salsa, and sour cream. Add chicken $4. Add steak $4. Add shrimp $4", gf: true },
      { name: "French Onion Dip", price: "$6", desc: "Creamy Lawson's French onion dip served with Golden Crisp Kettle chips", gf: true },
      { name: "Mini Corn Dogs", price: "$9", desc: "Beef hotdogs in a cornmeal batter fried and served with honey mustard dipping sauce" },
      { name: "Trio of Dips", price: "$12", desc: "Can't decide? Try all 3 of our dips on one platter. Beer cheese, Buffalo chicken, and salsa served with tortilla chips", gf: true },
    ],
  },
  {
    id: "fries",
    label: "Overloaded Fries",
    items: [
      { name: "Loaded Fries", price: "$10", desc: "Topped with beer cheese, bacon, green onions, and bacon aioli", gf: true, spx: true },
      { name: "Cincinnati Chili Fries", price: "$9", desc: "Topped with chili, shredded cheese and onions", gf: true },
      { name: "Reuben Fries", price: "$10", desc: "Loaded with corned beef, sauerkraut and 1000 Island", gf: true },
      { name: "Hot Honey Garlic Fries", price: "$9", desc: "Diced fried chicken tenders, drizzled with hot honey, and garlic aioli" },
      { name: "Philly Fries", price: "$10", desc: "Loaded with steak or chicken philly meat, grilled onions and peppers, and melted cheese", gf: true },
      { name: "Buffalo Chicken Fries", price: "$10", desc: "Topped with house made buffalo chicken dip, drizzled with ranch", gf: true },
      { name: "Pizza Fries", price: "$9", desc: "Doused with marinara, melted Mozzarella, basil, and pepperoni", gf: true },
      { name: "S'mores Fries", price: "$9", desc: "Funnel cake fries topped with chocolate and marshmallow sauce" },
    ],
  },
  {
    id: "salads",
    label: "Salads & Soups",
    note: "Dressings: Bleu Cheese, Ranch, Italian, Caesar, Raspberry Vinaigrette, Honey Mustard, Balsamic Vinaigrette, Poppy Seed, White French, Oil & Vinegar. No croutons = Gluten Sensitive.",
    items: [
      { name: "Spunkmeyer w/ Grilled Chicken", price: "$12", desc: "Grilled chicken served on a bed of lettuce, topped with Mozzarella cheese, tomatoes, onions, croutons, grilled banana peppers and onions" },
      { name: "Chef Salad", price: "$12", desc: "Ham, salami, pepperoni, tomatoes, cucumbers, onions, egg, bacon crumbles and cheese all placed on a bed of Romaine lettuce", gf: true },
      { name: "Caesar Salad", price: "$9", desc: "Romaine lettuce with creamy Caesar, croutons and Parmesan cheese. Add Fried or Grilled Chicken, Shrimp or Steak $4" },
      { name: "House Salad", price: "$9", desc: "Lettuce topped Cheddar cheese, tomatoes, red onions, cucumber and egg. Add Fried or Grilled Chicken, Shrimp or Steak $4", gf: true },
      { name: "Spunks Own Chili", price: "$7 / Loaded $8", desc: "", gf: true },
      { name: "French Onion Soup", price: "$7", desc: "" },
      { name: "Loaded Potato Soup", price: "$7", desc: "" },
      { name: "Soup & Salad Combo", price: "$10", desc: "" },
    ],
  },
  {
    id: "pizzas",
    label: "Pizzas",
    note: "Build your own thin crust. Extra toppings $2.50. Grilled Chicken $4.",
    items: [
      { name: '12" Cheese', price: "$13", desc: "Extra cheese $2.50" },
      { name: '12" White Veggie', price: "$15", desc: "Garlic Parmesan sauce, tomato, mushrooms, green peppers, onions and banana peppers" },
      { name: '12" Nashville Hot', price: "$16", desc: "Spunks own Nashville hot sauce, on NY style thin crust topped with fried chicken tenders, mozzarella cheese, and sliced pickles drizzled with ranch" },
      { name: '12" Deluxe', price: "$16", desc: "Pepperoni, sausage, onion, mushroom and green pepper" },
      { name: '12" Dawg Pound', price: "$17", desc: "Extra pepperoni, sausage, ham, and bacon. NO VEGGIES ALLOWED!" },
      { name: '12" Spicy Grilled Chicken', price: "$16", desc: "Spicy grilled chicken with our signature Spunkmeyer garlic hot sauce, Mozzarella and Cheddar cheese drizzled with ranch dressing" },
      { name: '12" Bacon Smashburger', price: "$16", desc: "Spunks smashburger sauce, topped w/bacon, pickles, onions and burger then drizzled in Buck Naked Bourbon Aioli" },
      { name: '12" Philly Cheesesteak', price: "$17", desc: "Tender slices of steak, fresh onions, green peppers and mushrooms, with shredded Mozzarella and Provolone cheese on top of our creamy cajun alfredo sauce" },
    ],
  },
  {
    id: "burgers",
    label: "Smash Burgers",
    note: "All burgers and sandwiches served w/Gold'n Krisp chips. Add fries $3. Add onion rings or side salad $4. Add bacon to any burger $2.",
    items: [
      { name: "Buck Naked Burger", price: "$14", desc: "Named after our very own BUCK NAKED BAND. Fresh double smash burger on a Brioche bun, with caramelized onions, sauteed mushrooms, Swiss and Provolone cheese with a house made Bulleit Bourbon and bacon aioli. OUR TOP SELLING BURGER!", topSeller: true },
      { name: "Rodeo Burger", price: "$14", desc: "Double SMASH burger on a Brioche bun with Cheddar cheese, BBQ sauce and onion ring" },
      { name: "The Triple Grizzly", price: "$15", desc: "Triple SMASH patties loaded with cheese, lettuce, pickles and special spunks sauce. TOO MUCH MEAT? MAKE IT A DOUBLE $13" },
      { name: "Back the Blue Burger", price: "$14", desc: "Fresh double smash burger, with cajun seasoning, sauteed onions, blue cheese crumbles, lettuce, and tomato on a Brioche bun" },
      { name: "Southwest Burger", price: "$14", desc: "Double SMASH burger with lettuce, tomato, onion, topped with melted Provolone cheese, jalapeno ranch sauce and avocado spread on a grilled Brioche bun" },
      { name: "PB & J Burger", price: "$14", desc: "Double SMASH burger American cheese, caramelized onions, peanut butter, and strawberry jam on a Brioche bun" },
      { name: "Beer Cheese Burger", price: "$14", desc: "Double smash patties topped with sauteed onions, cheese and served dipped in melty Beer cheese" },
    ],
  },
  {
    id: "buildyourown",
    label: "Build Your Own",
    note: "Our fresh NEVER frozen burgers served on a grilled Brioche bun w/lettuce, tomato & pickle. Pick 2 toppings FREE!",
    items: [
      { name: 'Spunks Own "Smash" Burger - Single', price: "$9", desc: "" },
      { name: 'Spunks Own "Smash" Burger - Double', price: "$11", desc: "" },
      { name: "Free Toppings", price: "", desc: "Honey Mustard, Jalapenos, Caesar, Mayo, Onions, Ranch, BBQ, Cajun Seasoning, Chipotle Mayo" },
      { name: "Premium Toppings ($2 each)", price: "", desc: "Bacon, Mushrooms, Peppers or Onions, Onion Rings, Avocado Spread" },
      { name: "Cheese ($1 each)", price: "", desc: "Mozzarella, Provolone, American, Cheddar, Swiss, Blue Cheese, Beer Cheese" },
    ],
  },
  {
    id: "handhelds",
    label: "Handhelds",
    note: "All burgers and sandwiches served w/Gold'n Krisp chips. Add fries $3. Add onion rings or side salad $4. All can be made into WRAPS!",
    items: [
      { name: "Spunks Reuben", price: "$13", desc: "Shaved corned beef, Swiss cheese, sauerkraut and 1000 Island dressing on grilled marble rye bread. Can also be substituted with turkey!" },
      { name: "The Club", price: "$13", desc: "Ham, turkey, bacon, American cheese, lettuce, tomato and mayonnaise on grilled Texas toast" },
      { name: "The Spunkmeyer!", price: "$13", desc: "Our signature sandwich! Stacks of thin fried bologna, American cheese, grilled onions and mayo", spx: true },
      { name: "The Hot Italian", price: "$14", desc: "Ham, salami, hot capicola, and pepperoni make for a tasty blend. Topped with Provolone, red onion, lettuce, tomato, banana peppers, and Italian dressing on a grilled Hoagie bun" },
      { name: "Ultimate BLT", price: "$12", desc: "Loads of Bacon, tomato, lettuce, mayo and bacon aioli" },
      { name: "Blackened Chicken", price: "$14", desc: "Blackened chicken breast, bacon, Provolone cheese, chipotle mayo, lettuce, and tomato on a Brioche bun" },
      { name: "Nashville Hot Chicken", price: "$14", desc: "Our own Nashville hot sauce on a grilled or fried chicken breast, with fried pickles, Provolone cheese, lettuce, tomato, on a Brioche bun and ranch on the side" },
      { name: "Grilled Chicken Wrap", price: "$12", desc: "Grilled chicken, sauteed onions, mushrooms, green peppers, and Cheddar cheese" },
      { name: "Smash Burger Wrap", price: "$12", desc: "Our renowned diced smashed burger topped with American cheese with lettuce, tomato, and ranch dressing" },
      { name: "Wild Wing Wrap", price: "$12", desc: "Fried or grilled chicken tenders, tossed in your choice of wing sauce, lettuce, tomato, and Provolone cheese, with a side of ranch" },
      { name: "Grilled Chicken Caesar Wrap", price: "$12", desc: "Fried or grilled chicken, Caesar dressing, Romaine lettuce, and shredded Parmesan cheese" },
      { name: "Fish Sandwich", price: "$14", desc: "Fried cod, American cheese, tartar sauce, side of cole slaw on a Brioche bun" },
      { name: "Grilled Shrimp Poboy", price: "$14", desc: "Grilled shrimp, lettuce, tomato, cajun mayo on a hoagie roll" },
    ],
  },
  {
    id: "phillys",
    label: "Philly Melts",
    note: 'All served on "classic" Philly Amoroso rolls. Want it in a WRAP? Just ask!',
    items: [
      { name: "Steak Philly", price: "$13", desc: "Shaved ribeye, grilled onions and peppers, melted white American and mayo" },
      { name: "Chicken Philly", price: "$13", desc: "Grilled chicken, onions and peppers, melted white American and mayo" },
      { name: "The Wiz", price: "$14", desc: "Shaved ribeye or chicken, grilled onions, mushrooms and Beer cheese" },
      { name: "Chicken Bacon Ranch", price: "$14", desc: "Grilled chicken, bacon, ranch, lettuce, tomato, bacon aioli and melted white American. Spicy? Add jalapeno or Chipotle ranch $.75" },
      { name: "Pizza Philly", price: "$14", desc: "Shaved ribeye, mushrooms, Mozzarella, marinara and parmesan cheese" },
      { name: "The Cure", price: "$15", desc: "Shaved ribeye or chicken, grilled onions, mushrooms, bacon, fries with white American and beer cheese for dipping" },
    ],
  },
  {
    id: "tacos",
    label: "Tacos",
    items: [
      { name: "Shrimp Tacos (3)", price: "$12", desc: "Grilled shrimp and tossed with pineapple pico" },
      { name: "Fish Tacos (3)", price: "$12", desc: "Fried cod topped with cilantro lime cole slaw and drizzled with sweet chili sauce" },
      { name: "Steak Tacos (3)", price: "$13", desc: "Carne asada marinated steak topped with fresh tomato salsa, shredded cheese and side of lime crema" },
      { name: "Mango Habanero Chicken Tacos (3)", price: "$12", desc: "Mango habanero marinated grilled chicken covered with our house made cilantro coleslaw, and pineapple pico. Served with a side of sour cream" },
    ],
  },
  {
    id: "entrees",
    label: "Entrees",
    items: [
      { name: "Fish & Chips", price: "$15", desc: "Cod fish & chips served with coleslaw and tartar sauce" },
      { name: "Grilled Shrimp", price: "$15", desc: "8 grilled and seasoned shrimp, served with fries, coleslaw and tartar sauce" },
      { name: "Chicken Tender Basket", price: "$14", desc: "Chicken tenders fried golden and crispy, served with a side of fries. You pick your dipping sauce" },
    ],
  },
  {
    id: "sides",
    label: "Sides",
    items: [
      { name: "Thin Cut Fries", price: "$4", desc: "" },
      { name: "Brew City Fries", price: "$4", desc: "" },
      { name: "Onion Rings", price: "$5", desc: "" },
      { name: "Coleslaw", price: "$4", desc: "" },
      { name: "Broccoli", price: "$4", desc: "" },
      { name: "Cup of Soup", price: "$5", desc: "" },
      { name: "Side Salad", price: "$5", desc: "" },
      { name: "French Onion Dip", price: "$2", desc: "" },
    ],
  },
];

export default function Menu() {
  const [activeTab, setActiveTab] = useState("wings");
  const tabsRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setActiveTab(id);
          }
        });
      },
      { threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const el = sectionRefs.current[id];
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 160;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <SEO
        title="Menu | Spunkmeyers Pub & Grill - Smash Burgers, Wings, Loaded Fries"
        description="Full menu at Spunkmeyers Pub & Grill in Wadsworth, OH. Smash burgers, bone-in wings, loaded fries, pierogies, wraps, salads, and 18 beers on tap. Cooked to order, made fresh daily."
        path="/menu"
        ogImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663307809653/h2sUkzseCcZWErJdcht2p3/wings_656d55f5.jpg"
        jsonLd={menuSchema}
      />
      {/* Hero */}
      <section className="relative h-[35vh] sm:h-[50vh] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.wings})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-[#1a1a1a]" />
        <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            Our Menu
          </h1>
        </div>
      </section>

      {/* Sticky Tabs */}
      <div className="sticky top-20 z-30 bg-[#111111]/95 backdrop-blur-md border-b border-white/5">
        <div
          ref={tabsRef}
          className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 overflow-x-auto py-3 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToSection(cat.id)}
              className={`menu-tab ${activeTab === cat.id ? "active" : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {menuData.map((category) => (
          <div
            key={category.id}
            data-section={category.id}
            ref={(el) => { sectionRefs.current[category.id] = el; }}
            className="mb-10 sm:mb-16"
          >
            <div className="mb-6 border-b border-[#E8601C]/30 pb-3">
              <h2 className="font-heading text-3xl sm:text-4xl text-[#E8601C]">
                {category.label}
              </h2>
              {category.note && (
                <p className="text-[#999] text-sm mt-2 italic">{category.note}</p>
              )}
            </div>

            {category.id === "sauces" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {category.items.map((item, i) => (
                  <div key={i} className="bg-[#222] px-4 py-3 border border-white/5 flex items-center gap-2">
                    <span className="text-[#F5F0EB] text-sm">{item.name}</span>
                    {item.spx && <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm flex-shrink-0">SPX</span>}
                  </div>
                ))}
                <div className="col-span-full mt-4">
                  <p className="text-[#E8601C] font-heading text-sm uppercase tracking-wider mb-2">Dry Rubs</p>
                  <div className="flex flex-wrap gap-3">
                    {["Bourbon", "Cajun", "Jerk", "Parmesan Ranch", "Lemon Pepper"].map((rub) => (
                      <span key={rub} className="bg-[#222] px-4 py-2 border border-white/5 text-[#F5F0EB] text-sm">
                        {rub} {rub === "Bourbon" && <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm ml-1">SPX</span>}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {category.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-[#222] p-5 border border-white/5 hover:border-[#E8601C]/20 transition-colors duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-[#F5F0EB] font-semibold text-base group-hover:text-[#E8601C] transition-colors">
                          {item.name}
                        </h3>
                        {item.topSeller && (
                          <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-2 py-0.5 rounded-sm">
                            Top Seller
                          </span>
                        )}
                        {item.gf && (
                          <span className="text-[8px] font-heading uppercase tracking-wider border border-green-500/50 text-green-400 px-1.5 py-0.5 rounded-sm">
                            GF
                          </span>
                        )}
                        {item.spx && (
                          <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm">
                            SPX
                          </span>
                        )}
                      </div>
                      {item.price && (
                        <span className="text-[#E8601C] font-heading text-lg font-bold flex-shrink-0">
                          {item.price}
                        </span>
                      )}
                    </div>
                    {item.desc && (
                      <p className="text-[#999] text-sm leading-relaxed">{item.desc}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Legend */}
        <div className="border-t border-white/10 pt-6 mt-8 flex flex-wrap gap-6 text-sm text-[#999]">
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-heading uppercase tracking-wider border border-green-500/50 text-green-400 px-1.5 py-0.5 rounded-sm">GF</span>
            <span>Gluten Sensitive</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-heading uppercase tracking-wider bg-[#E8601C] text-white px-1.5 py-0.5 rounded-sm">SPX</span>
            <span>Spunkmeyers Original</span>
          </div>
        </div>
      </div>

      {/* Bottom spacer for mobile sticky button */}
      <div className="h-20 bg-[#1a1a1a] lg:hidden" />
    </div>
  );
}
