import { BUSINESS } from "@/lib/constants";

export const visitQuestions = [
  {
    question: "Where is Spunkmeyers Pub & Grill?",
    answer: `Spunkmeyers Pub & Grill is at ${BUSINESS.address}. Call ${BUSINESS.phone} for help planning your visit.`,
  },
  {
    question: "What are Spunkmeyers’ opening hours?",
    answer:
      BUSINESS.hours.map(({ day, hours }) => `${day}: ${hours}`).join("; ") +
      ". All hours are local to Wadsworth, Ohio. For holiday hours or kitchen availability, call the pub.",
  },
  {
    question: "What food does Spunkmeyers serve?",
    answer:
      "The food menu includes smash burgers, traditional and boneless wings, loaded fries, pizzas, sandwiches, wraps, salads and entrees. View the Menu page for item descriptions and prices, or download the printed menu.",
  },
  {
    question: "Can I order Spunkmeyers for delivery?",
    answer:
      "Yes. Use the Order Online links on this website to order from Spunkmeyers through DoorDash. Delivery availability and checkout details are provided by DoorDash.",
  },
  {
    question: "Does Spunkmeyers have an outdoor patio?",
    answer:
      "Yes. The Buck Naked Bar is Spunkmeyers’ outdoor bar and patio. See the Experience page for photos of the space.",
  },
  {
    question: "Can I watch Cleveland sports at Spunkmeyers?",
    answer:
      "Yes. Spunkmeyers is a Cleveland Browns Backer Bar and shows Cleveland sports and the Ohio State Buckeyes. Check the homepage’s On the Big Screens section or call for a particular game.",
  },
  {
    question: "Is Spunkmeyers a Christmas pop-up bar?",
    answer:
      "During the Christmas season, Spunkmeyers transforms into a Christmas pop-up bar with lights, ornaments and decorated rooms throughout the pub. Visit the homepage for the seasonal photos and walk-through videos.",
  },
  {
    question: "How do I ask about a party or group visit?",
    answer:
      "Use the party request form on the Events page, or call (330) 334-5080. Submitting the form is a request; the team will contact you to confirm the arrangements.",
  },
];
