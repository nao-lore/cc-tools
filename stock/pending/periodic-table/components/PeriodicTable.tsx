"use client";

import { useState, useMemo } from "react";

type Category =
  | "alkali-metal"
  | "alkaline-earth"
  | "transition-metal"
  | "post-transition"
  | "metalloid"
  | "nonmetal"
  | "halogen"
  | "noble-gas"
  | "lanthanide"
  | "actinide";

type Element = {
  atomicNumber: number;
  symbol: string;
  name: string;
  mass: string;
  category: Category;
  electronConfig: string;
  uses: string;
  group: number;
  period: number;
};

const CATEGORY_COLORS: Record<Category, { bg: string; text: string; border: string; label: string }> = {
  "alkali-metal":     { bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300",    label: "Alkali Metal" },
  "alkaline-earth":   { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", label: "Alkaline Earth" },
  "transition-metal": { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", label: "Transition Metal" },
  "post-transition":  { bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300",  label: "Post-Transition" },
  "metalloid":        { bg: "bg-teal-100",   text: "text-teal-800",   border: "border-teal-300",   label: "Metalloid" },
  "nonmetal":         { bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300",   label: "Nonmetal" },
  "halogen":          { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300", label: "Halogen" },
  "noble-gas":        { bg: "bg-pink-100",   text: "text-pink-800",   border: "border-pink-300",   label: "Noble Gas" },
  "lanthanide":       { bg: "bg-amber-100",  text: "text-amber-800",  border: "border-amber-300",  label: "Lanthanide" },
  "actinide":         { bg: "bg-lime-100",   text: "text-lime-800",   border: "border-lime-300",   label: "Actinide" },
};

const ELEMENTS: Element[] = [
  { atomicNumber: 1,   symbol: "H",   name: "Hydrogen",      mass: "1.008",   category: "nonmetal",         electronConfig: "1s¹",                    group: 1,  period: 1, uses: "Fuel cells and rocket propellant. Used in refining petroleum and producing ammonia for fertilizers." },
  { atomicNumber: 2,   symbol: "He",  name: "Helium",        mass: "4.003",   category: "noble-gas",        electronConfig: "1s²",                    group: 18, period: 1, uses: "Filling balloons and airships due to its low density. Cryogenic coolant for MRI machines and superconductors." },
  { atomicNumber: 3,   symbol: "Li",  name: "Lithium",       mass: "6.941",   category: "alkali-metal",     electronConfig: "[He] 2s¹",               group: 1,  period: 2, uses: "Rechargeable batteries in phones and electric vehicles. Used in mood-stabilizing psychiatric medications." },
  { atomicNumber: 4,   symbol: "Be",  name: "Beryllium",     mass: "9.012",   category: "alkaline-earth",   electronConfig: "[He] 2s²",               group: 2,  period: 2, uses: "Aerospace structural material due to stiffness and light weight. Used in X-ray windows and nuclear reactors." },
  { atomicNumber: 5,   symbol: "B",   name: "Boron",         mass: "10.811",  category: "metalloid",        electronConfig: "[He] 2s² 2p¹",           group: 13, period: 2, uses: "Borosilicate glass (Pyrex) for heat resistance. Used as a neutron absorber in nuclear reactor control rods." },
  { atomicNumber: 6,   symbol: "C",   name: "Carbon",        mass: "12.011",  category: "nonmetal",         electronConfig: "[He] 2s² 2p²",           group: 14, period: 2, uses: "Foundation of all organic life and chemistry. Used as graphite in pencils and diamonds in cutting tools." },
  { atomicNumber: 7,   symbol: "N",   name: "Nitrogen",      mass: "14.007",  category: "nonmetal",         electronConfig: "[He] 2s² 2p³",           group: 15, period: 2, uses: "Makes up 78% of Earth's atmosphere. Used to produce ammonia for fertilizers that feed most of humanity." },
  { atomicNumber: 8,   symbol: "O",   name: "Oxygen",        mass: "15.999",  category: "nonmetal",         electronConfig: "[He] 2s² 2p⁴",           group: 16, period: 2, uses: "Essential for aerobic respiration in living organisms. Used in steel production and medical oxygen therapy." },
  { atomicNumber: 9,   symbol: "F",   name: "Fluorine",      mass: "18.998",  category: "halogen",          electronConfig: "[He] 2s² 2p⁵",           group: 17, period: 2, uses: "Added to toothpaste and drinking water to prevent tooth decay. Used in producing Teflon non-stick coatings." },
  { atomicNumber: 10,  symbol: "Ne",  name: "Neon",          mass: "20.180",  category: "noble-gas",        electronConfig: "[He] 2s² 2p⁶",           group: 18, period: 2, uses: "Iconic neon signs and advertising displays. Used in high-voltage indicators and plasma display panels." },
  { atomicNumber: 11,  symbol: "Na",  name: "Sodium",        mass: "22.990",  category: "alkali-metal",     electronConfig: "[Ne] 3s¹",               group: 1,  period: 3, uses: "Table salt (NaCl) is essential for human health and food preservation. Used in street lighting as sodium vapor lamps." },
  { atomicNumber: 12,  symbol: "Mg",  name: "Magnesium",     mass: "24.305",  category: "alkaline-earth",   electronConfig: "[Ne] 3s²",               group: 2,  period: 3, uses: "Lightweight structural alloys in cars and aircraft. Essential mineral for human bone and muscle function." },
  { atomicNumber: 13,  symbol: "Al",  name: "Aluminum",      mass: "26.982",  category: "post-transition",  electronConfig: "[Ne] 3s² 3p¹",           group: 13, period: 3, uses: "Most widely used non-ferrous metal for packaging, transport, and construction. Fully recyclable with high efficiency." },
  { atomicNumber: 14,  symbol: "Si",  name: "Silicon",       mass: "28.086",  category: "metalloid",        electronConfig: "[Ne] 3s² 3p²",           group: 14, period: 3, uses: "Foundation of modern electronics and semiconductor chips. Used in solar panels and as silica in glass making." },
  { atomicNumber: 15,  symbol: "P",   name: "Phosphorus",    mass: "30.974",  category: "nonmetal",         electronConfig: "[Ne] 3s² 3p³",           group: 15, period: 3, uses: "Critical component of fertilizers for global agriculture. Found in DNA, RNA, and ATP in all living cells." },
  { atomicNumber: 16,  symbol: "S",   name: "Sulfur",        mass: "32.065",  category: "nonmetal",         electronConfig: "[Ne] 3s² 3p⁴",           group: 16, period: 3, uses: "Production of sulfuric acid, the most produced industrial chemical. Used in rubber vulcanization and fungicides." },
  { atomicNumber: 17,  symbol: "Cl",  name: "Chlorine",      mass: "35.453",  category: "halogen",          electronConfig: "[Ne] 3s² 3p⁵",           group: 17, period: 3, uses: "Water disinfection and purification worldwide. Used to produce PVC plastic and bleach for sanitation." },
  { atomicNumber: 18,  symbol: "Ar",  name: "Argon",         mass: "39.948",  category: "noble-gas",        electronConfig: "[Ne] 3s² 3p⁶",           group: 18, period: 3, uses: "Inert atmosphere for welding to prevent oxidation. Used in incandescent and fluorescent light bulbs." },
  { atomicNumber: 19,  symbol: "K",   name: "Potassium",     mass: "39.098",  category: "alkali-metal",     electronConfig: "[Ar] 4s¹",               group: 1,  period: 4, uses: "Potassium chloride is a major component of fertilizers. Essential electrolyte for heart and muscle function." },
  { atomicNumber: 20,  symbol: "Ca",  name: "Calcium",       mass: "40.078",  category: "alkaline-earth",   electronConfig: "[Ar] 4s²",               group: 2,  period: 4, uses: "Main mineral in bones and teeth. Used in cement, plaster, and as a reducing agent in metal production." },
  { atomicNumber: 21,  symbol: "Sc",  name: "Scandium",      mass: "44.956",  category: "transition-metal", electronConfig: "[Ar] 3d¹ 4s²",           group: 3,  period: 4, uses: "Lightweight alloys for aerospace and sporting equipment like bicycle frames. Used in metal halide lamps." },
  { atomicNumber: 22,  symbol: "Ti",  name: "Titanium",      mass: "47.867",  category: "transition-metal", electronConfig: "[Ar] 3d² 4s²",           group: 4,  period: 4, uses: "Strong, lightweight metal for aircraft, spacecraft, and medical implants. Used in white paint pigment (TiO₂)." },
  { atomicNumber: 23,  symbol: "V",   name: "Vanadium",      mass: "50.942",  category: "transition-metal", electronConfig: "[Ar] 3d³ 4s²",           group: 5,  period: 4, uses: "Steel alloys for tools, springs, and high-strength structural steel. Used in vanadium redox flow batteries." },
  { atomicNumber: 24,  symbol: "Cr",  name: "Chromium",      mass: "51.996",  category: "transition-metal", electronConfig: "[Ar] 3d⁵ 4s¹",           group: 6,  period: 4, uses: "Chromium plating for corrosion resistance and decorative finishes. Essential component of stainless steel." },
  { atomicNumber: 25,  symbol: "Mn",  name: "Manganese",     mass: "54.938",  category: "transition-metal", electronConfig: "[Ar] 3d⁵ 4s²",           group: 7,  period: 4, uses: "Added to steel to increase hardness and toughness. Used in dry cell batteries and as a water purification agent." },
  { atomicNumber: 26,  symbol: "Fe",  name: "Iron",          mass: "55.845",  category: "transition-metal", electronConfig: "[Ar] 3d⁶ 4s²",           group: 8,  period: 4, uses: "Most widely used metal, primary component of steel for construction and manufacturing. Essential in blood hemoglobin." },
  { atomicNumber: 27,  symbol: "Co",  name: "Cobalt",        mass: "58.933",  category: "transition-metal", electronConfig: "[Ar] 3d⁷ 4s²",           group: 9,  period: 4, uses: "Lithium-ion battery cathodes in phones and EVs. Used in superalloys for jet engines and blue pigment in glass." },
  { atomicNumber: 28,  symbol: "Ni",  name: "Nickel",        mass: "58.693",  category: "transition-metal", electronConfig: "[Ar] 3d⁸ 4s²",           group: 10, period: 4, uses: "Stainless steel production and electroplating for corrosion resistance. Used in rechargeable batteries." },
  { atomicNumber: 29,  symbol: "Cu",  name: "Copper",        mass: "63.546",  category: "transition-metal", electronConfig: "[Ar] 3d¹⁰ 4s¹",          group: 11, period: 4, uses: "Electrical wiring due to high conductivity. Used in plumbing, coins, and as an antimicrobial surface material." },
  { atomicNumber: 30,  symbol: "Zn",  name: "Zinc",          mass: "65.38",   category: "transition-metal", electronConfig: "[Ar] 3d¹⁰ 4s²",          group: 12, period: 4, uses: "Galvanizing steel to prevent rust. Essential trace mineral for immune function and used in sunscreen (ZnO)." },
  { atomicNumber: 31,  symbol: "Ga",  name: "Gallium",       mass: "69.723",  category: "post-transition",  electronConfig: "[Ar] 3d¹⁰ 4s² 4p¹",     group: 13, period: 4, uses: "Gallium arsenide semiconductors in LEDs and solar cells. Used in integrated circuits and as a mercury substitute in thermometers." },
  { atomicNumber: 32,  symbol: "Ge",  name: "Germanium",     mass: "72.630",  category: "metalloid",        electronConfig: "[Ar] 3d¹⁰ 4s² 4p²",     group: 14, period: 4, uses: "Fiber optic cables and infrared optics. Used as a semiconductor in transistors and solar cells." },
  { atomicNumber: 33,  symbol: "As",  name: "Arsenic",       mass: "74.922",  category: "metalloid",        electronConfig: "[Ar] 3d¹⁰ 4s² 4p³",     group: 15, period: 4, uses: "Gallium arsenide for high-speed electronics and LEDs. Used as a wood preservative and historically as a poison." },
  { atomicNumber: 34,  symbol: "Se",  name: "Selenium",      mass: "78.971",  category: "nonmetal",         electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁴",     group: 16, period: 4, uses: "Photocopier drums and solar cells due to photoconductivity. Essential trace element in human nutrition and antioxidant enzymes." },
  { atomicNumber: 35,  symbol: "Br",  name: "Bromine",       mass: "79.904",  category: "halogen",          electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁵",     group: 17, period: 4, uses: "Flame retardants in electronics and furniture. Used in water treatment and historically in photography." },
  { atomicNumber: 36,  symbol: "Kr",  name: "Krypton",       mass: "83.798",  category: "noble-gas",        electronConfig: "[Ar] 3d¹⁰ 4s² 4p⁶",     group: 18, period: 4, uses: "High-performance photographic flash lamps and energy-efficient windows. Used in laser technology for eye surgery." },
  { atomicNumber: 37,  symbol: "Rb",  name: "Rubidium",      mass: "85.468",  category: "alkali-metal",     electronConfig: "[Kr] 5s¹",               group: 1,  period: 5, uses: "Atomic clocks for precise timekeeping in GPS and telecommunications. Used in photocells and vacuum tube manufacturing." },
  { atomicNumber: 38,  symbol: "Sr",  name: "Strontium",     mass: "87.62",   category: "alkaline-earth",   electronConfig: "[Kr] 5s²",               group: 2,  period: 5, uses: "Bright red fireworks and signal flares. Used in cathode ray tubes and radioactive isotope ⁸⁹Sr for bone cancer treatment." },
  { atomicNumber: 39,  symbol: "Y",   name: "Yttrium",       mass: "88.906",  category: "transition-metal", electronConfig: "[Kr] 4d¹ 5s²",           group: 3,  period: 5, uses: "Red phosphor in color TV tubes and LED lighting. Used in high-temperature superconductors and strong alloys." },
  { atomicNumber: 40,  symbol: "Zr",  name: "Zirconium",     mass: "91.224",  category: "transition-metal", electronConfig: "[Kr] 4d² 5s²",           group: 4,  period: 5, uses: "Nuclear reactor cladding due to low neutron absorption. Used in ceramic knives, dental prosthetics, and heat-resistant coatings." },
  { atomicNumber: 41,  symbol: "Nb",  name: "Niobium",       mass: "92.906",  category: "transition-metal", electronConfig: "[Kr] 4d⁴ 5s¹",           group: 5,  period: 5, uses: "High-strength steel alloys for pipelines and automotive parts. Used in superconducting magnets for MRI and particle accelerators." },
  { atomicNumber: 42,  symbol: "Mo",  name: "Molybdenum",    mass: "95.96",   category: "transition-metal", electronConfig: "[Kr] 4d⁵ 5s¹",           group: 6,  period: 5, uses: "High-strength steel alloys and lubricants. Essential trace element in nitrogen fixation enzymes in plants." },
  { atomicNumber: 43,  symbol: "Tc",  name: "Technetium",    mass: "(98)",    category: "transition-metal", electronConfig: "[Kr] 4d⁵ 5s²",           group: 7,  period: 5, uses: "Medical imaging isotope ⁹⁹ᵐTc used in millions of diagnostic scans yearly. Only synthetic element in this period." },
  { atomicNumber: 44,  symbol: "Ru",  name: "Ruthenium",     mass: "101.07",  category: "transition-metal", electronConfig: "[Kr] 4d⁷ 5s¹",           group: 8,  period: 5, uses: "Electrical contacts and wear-resistant alloys. Used as a catalyst in chemical synthesis and hydrogen production." },
  { atomicNumber: 45,  symbol: "Rh",  name: "Rhodium",       mass: "102.906", category: "transition-metal", electronConfig: "[Kr] 4d⁸ 5s¹",           group: 9,  period: 5, uses: "Catalytic converters in cars to reduce harmful exhaust emissions. Used in jewelry as a bright, tarnish-resistant plating." },
  { atomicNumber: 46,  symbol: "Pd",  name: "Palladium",     mass: "106.42",  category: "transition-metal", electronConfig: "[Kr] 4d¹⁰",              group: 10, period: 5, uses: "Catalytic converters and hydrogen purification membranes. Used in electronics and as a catalyst in pharmaceutical production." },
  { atomicNumber: 47,  symbol: "Ag",  name: "Silver",        mass: "107.868", category: "transition-metal", electronConfig: "[Kr] 4d¹⁰ 5s¹",          group: 11, period: 5, uses: "Photography, jewelry, and silverware. Highest electrical conductivity of all metals; used in electronics and antimicrobial coatings." },
  { atomicNumber: 48,  symbol: "Cd",  name: "Cadmium",       mass: "112.411", category: "transition-metal", electronConfig: "[Kr] 4d¹⁰ 5s²",          group: 12, period: 5, uses: "Nickel-cadmium rechargeable batteries. Used in solar cells, electroplating, and as pigment in yellow and orange paints." },
  { atomicNumber: 49,  symbol: "In",  name: "Indium",        mass: "114.818", category: "post-transition",  electronConfig: "[Kr] 4d¹⁰ 5s² 5p¹",     group: 13, period: 5, uses: "Indium tin oxide coatings for touchscreens and LCD displays. Used in low-melting-point alloys and semiconductors." },
  { atomicNumber: 50,  symbol: "Sn",  name: "Tin",           mass: "118.710", category: "post-transition",  electronConfig: "[Kr] 4d¹⁰ 5s² 5p²",     group: 14, period: 5, uses: "Tin cans (steel coated with tin) for food preservation. Used in soldering alloys for electronics assembly." },
  { atomicNumber: 51,  symbol: "Sb",  name: "Antimony",      mass: "121.760", category: "metalloid",        electronConfig: "[Kr] 4d¹⁰ 5s² 5p³",     group: 15, period: 5, uses: "Flame retardants in plastics and textiles. Used in lead-acid batteries and as a semiconductor dopant." },
  { atomicNumber: 52,  symbol: "Te",  name: "Tellurium",     mass: "127.60",  category: "metalloid",        electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁴",     group: 16, period: 5, uses: "Cadmium telluride solar panels. Used to improve machinability of steel and as a semiconductor material." },
  { atomicNumber: 53,  symbol: "I",   name: "Iodine",        mass: "126.904", category: "halogen",          electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁵",     group: 17, period: 5, uses: "Antiseptic for wound treatment and added to table salt to prevent thyroid disorders. Used in photography and pharmaceuticals." },
  { atomicNumber: 54,  symbol: "Xe",  name: "Xenon",         mass: "131.293", category: "noble-gas",        electronConfig: "[Kr] 4d¹⁰ 5s² 5p⁶",     group: 18, period: 5, uses: "High-intensity arc lamps for cinema projectors and car headlights. Used as anesthetic and in ion propulsion for spacecraft." },
  { atomicNumber: 55,  symbol: "Cs",  name: "Cesium",        mass: "132.905", category: "alkali-metal",     electronConfig: "[Xe] 6s¹",               group: 1,  period: 6, uses: "Atomic clocks defining the SI second for global timekeeping. Used in drilling fluids in oil and gas exploration." },
  { atomicNumber: 56,  symbol: "Ba",  name: "Barium",        mass: "137.327", category: "alkaline-earth",   electronConfig: "[Xe] 6s²",               group: 2,  period: 6, uses: "Barium sulfate as a contrast agent for GI X-ray imaging. Used in green fireworks and oil well drilling mud." },
  { atomicNumber: 57,  symbol: "La",  name: "Lanthanum",     mass: "138.905", category: "lanthanide",       electronConfig: "[Xe] 5d¹ 6s²",           group: 3,  period: 6, uses: "Hybrid car batteries and camera/telescope lenses. Used in hydrogen storage alloys and petroleum refining catalysts." },
  { atomicNumber: 58,  symbol: "Ce",  name: "Cerium",        mass: "140.116", category: "lanthanide",       electronConfig: "[Xe] 4f¹ 5d¹ 6s²",      group: 3,  period: 6, uses: "Catalytic converters and self-cleaning oven coatings. Most abundant rare earth element; used in polishing compounds for glass." },
  { atomicNumber: 59,  symbol: "Pr",  name: "Praseodymium",  mass: "140.908", category: "lanthanide",       electronConfig: "[Xe] 4f³ 6s²",           group: 3,  period: 6, uses: "Strong permanent magnets for wind turbines and EV motors. Used in aircraft engine alloys and yellow ceramic glazes." },
  { atomicNumber: 60,  symbol: "Nd",  name: "Neodymium",     mass: "144.242", category: "lanthanide",       electronConfig: "[Xe] 4f⁴ 6s²",           group: 3,  period: 6, uses: "Powerful neodymium magnets in hard drives, headphones, and electric motors. Used in laser technology and purple glass." },
  { atomicNumber: 61,  symbol: "Pm",  name: "Promethium",    mass: "(145)",   category: "lanthanide",       electronConfig: "[Xe] 4f⁵ 6s²",           group: 3,  period: 6, uses: "Nuclear batteries for spacecraft and guided missiles. Used in luminous paint for watches and instrument dials." },
  { atomicNumber: 62,  symbol: "Sm",  name: "Samarium",      mass: "150.36",  category: "lanthanide",       electronConfig: "[Xe] 4f⁶ 6s²",           group: 3,  period: 6, uses: "Samarium-cobalt magnets for high-temperature applications. Used in cancer treatment (samarium-153) and as a neutron absorber." },
  { atomicNumber: 63,  symbol: "Eu",  name: "Europium",      mass: "151.964", category: "lanthanide",       electronConfig: "[Xe] 4f⁷ 6s²",           group: 3,  period: 6, uses: "Red and blue phosphors in color TV screens and energy-efficient fluorescent lamps. Used in euro banknote security features." },
  { atomicNumber: 64,  symbol: "Gd",  name: "Gadolinium",    mass: "157.25",  category: "lanthanide",       electronConfig: "[Xe] 4f⁷ 5d¹ 6s²",      group: 3,  period: 6, uses: "MRI contrast agents to improve image clarity. Used in nuclear reactor shielding and magnetic refrigeration research." },
  { atomicNumber: 65,  symbol: "Tb",  name: "Terbium",       mass: "158.925", category: "lanthanide",       electronConfig: "[Xe] 4f⁹ 6s²",           group: 3,  period: 6, uses: "Green phosphors in fluorescent lamps and displays. Used in magnetostrictive alloys for sonar and naval detection systems." },
  { atomicNumber: 66,  symbol: "Dy",  name: "Dysprosium",    mass: "162.500", category: "lanthanide",       electronConfig: "[Xe] 4f¹⁰ 6s²",          group: 3,  period: 6, uses: "Added to neodymium magnets for high-temperature stability in EV motors. Used in nuclear reactor control rods." },
  { atomicNumber: 67,  symbol: "Ho",  name: "Holmium",       mass: "164.930", category: "lanthanide",       electronConfig: "[Xe] 4f¹¹ 6s²",          group: 3,  period: 6, uses: "Holmium lasers for medical and dental procedures. Used in creating strong magnetic fields and as a nuclear poison." },
  { atomicNumber: 68,  symbol: "Er",  name: "Erbium",        mass: "167.259", category: "lanthanide",       electronConfig: "[Xe] 4f¹² 6s²",          group: 3,  period: 6, uses: "Optical fiber amplifiers for long-distance telecommunications. Used in erbium-doped fiber amplifiers (EDFAs) in internet infrastructure." },
  { atomicNumber: 69,  symbol: "Tm",  name: "Thulium",       mass: "168.934", category: "lanthanide",       electronConfig: "[Xe] 4f¹³ 6s²",          group: 3,  period: 6, uses: "Portable X-ray devices for medical and dental use. Used in high-performance lasers and as a radiation source." },
  { atomicNumber: 70,  symbol: "Yb",  name: "Ytterbium",     mass: "173.054", category: "lanthanide",       electronConfig: "[Xe] 4f¹⁴ 6s²",          group: 3,  period: 6, uses: "Highly accurate atomic clocks for precision timekeeping. Used as a dopant in fiber lasers and stainless steel alloys." },
  { atomicNumber: 71,  symbol: "Lu",  name: "Lutetium",      mass: "174.967", category: "lanthanide",       electronConfig: "[Xe] 4f¹⁴ 5d¹ 6s²",     group: 3,  period: 6, uses: "PET scan detectors for cancer diagnosis. Used as a catalyst in petroleum refining and in LED lighting phosphors." },
  { atomicNumber: 72,  symbol: "Hf",  name: "Hafnium",       mass: "178.49",  category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d² 6s²",     group: 4,  period: 6, uses: "Nuclear reactor control rods due to high neutron absorption. Used in plasma cutting torches and microprocessor gate dielectrics." },
  { atomicNumber: 73,  symbol: "Ta",  name: "Tantalum",      mass: "180.948", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d³ 6s²",     group: 5,  period: 6, uses: "Capacitors in smartphones, laptops, and medical devices. Biocompatible for surgical implants and corrosion-resistant equipment." },
  { atomicNumber: 74,  symbol: "W",   name: "Tungsten",      mass: "183.84",  category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d⁴ 6s²",     group: 6,  period: 6, uses: "Incandescent light bulb filaments and cutting tools. Highest melting point of all metals; used in rocket nozzles." },
  { atomicNumber: 75,  symbol: "Re",  name: "Rhenium",       mass: "186.207", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d⁵ 6s²",     group: 7,  period: 6, uses: "Jet engine superalloys for high-temperature turbine blades. Used as a catalyst in lead-free gasoline production." },
  { atomicNumber: 76,  symbol: "Os",  name: "Osmium",        mass: "190.23",  category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d⁶ 6s²",     group: 8,  period: 6, uses: "Extremely hard alloys for fountain pen tips and instrument pivots. Densest naturally occurring element." },
  { atomicNumber: 77,  symbol: "Ir",  name: "Iridium",       mass: "192.217", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d⁷ 6s²",     group: 9,  period: 6, uses: "Spark plugs and crucibles for high-temperature applications. Most corrosion-resistant metal; used in the international kilogram standard." },
  { atomicNumber: 78,  symbol: "Pt",  name: "Platinum",      mass: "195.084", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d⁹ 6s¹",     group: 10, period: 6, uses: "Catalytic converters and fuel cell catalysts. Used in jewelry, laboratory equipment, and chemotherapy drugs (cisplatin)." },
  { atomicNumber: 79,  symbol: "Au",  name: "Gold",          mass: "196.967", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",    group: 11, period: 6, uses: "Jewelry, investment, and monetary standard throughout history. Excellent conductor used in electronics for reliable connections." },
  { atomicNumber: 80,  symbol: "Hg",  name: "Mercury",       mass: "200.592", category: "transition-metal", electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s²",    group: 12, period: 6, uses: "Thermometers and barometers (being phased out). Used in fluorescent lamps, dental amalgam, and gold mining amalgamation." },
  { atomicNumber: 81,  symbol: "Tl",  name: "Thallium",      mass: "204.383", category: "post-transition",  electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹", group: 13, period: 6, uses: "Cardiac imaging in nuclear medicine stress tests. Used in infrared detectors and as a highly toxic rodenticide (now restricted)." },
  { atomicNumber: 82,  symbol: "Pb",  name: "Lead",          mass: "207.2",   category: "post-transition",  electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²", group: 14, period: 6, uses: "Lead-acid batteries in vehicles. Used as X-ray and radiation shielding in medical and nuclear facilities." },
  { atomicNumber: 83,  symbol: "Bi",  name: "Bismuth",       mass: "208.980", category: "post-transition",  electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³", group: 15, period: 6, uses: "Pepto-Bismol for gastrointestinal relief. Used in low-melting-point alloys, lead-free solders, and cosmetics." },
  { atomicNumber: 84,  symbol: "Po",  name: "Polonium",      mass: "(209)",   category: "metalloid",        electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴", group: 16, period: 6, uses: "Antistatic devices in industrial applications. Used as a heat source in space probes and infamously as a poison." },
  { atomicNumber: 85,  symbol: "At",  name: "Astatine",      mass: "(210)",   category: "halogen",          electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵", group: 17, period: 6, uses: "Targeted alpha therapy for cancer treatment research. One of Earth's rarest naturally occurring elements." },
  { atomicNumber: 86,  symbol: "Rn",  name: "Radon",         mass: "(222)",   category: "noble-gas",        electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶", group: 18, period: 6, uses: "Historically used in cancer radiotherapy. Monitored in buildings as a radioactive hazard from uranium decay in soil." },
  { atomicNumber: 87,  symbol: "Fr",  name: "Francium",      mass: "(223)",   category: "alkali-metal",     electronConfig: "[Rn] 7s¹",               group: 1,  period: 7, uses: "Research into atomic structure due to its large atomic size. Extremely rare and radioactive with no significant commercial uses." },
  { atomicNumber: 88,  symbol: "Ra",  name: "Radium",        mass: "(226)",   category: "alkaline-earth",   electronConfig: "[Rn] 7s²",               group: 2,  period: 7, uses: "Historically used in luminescent watch dials (now banned). Used in cancer radiotherapy and radon gas production." },
  { atomicNumber: 89,  symbol: "Ac",  name: "Actinium",      mass: "(227)",   category: "actinide",         electronConfig: "[Rn] 6d¹ 7s²",           group: 3,  period: 7, uses: "Cancer treatment via actinium-225 targeted alpha therapy. Used as a neutron source and in scientific research." },
  { atomicNumber: 90,  symbol: "Th",  name: "Thorium",       mass: "232.038", category: "actinide",         electronConfig: "[Rn] 6d² 7s²",           group: 3,  period: 7, uses: "Potential nuclear fuel in thorium reactors as a safer uranium alternative. Used in high-temperature alloys and gas mantles." },
  { atomicNumber: 91,  symbol: "Pa",  name: "Protactinium",  mass: "231.036", category: "actinide",         electronConfig: "[Rn] 5f² 6d¹ 7s²",      group: 3,  period: 7, uses: "Scientific research into nuclear properties and actinide chemistry. Extremely rare with no significant practical applications." },
  { atomicNumber: 92,  symbol: "U",   name: "Uranium",       mass: "238.029", category: "actinide",         electronConfig: "[Rn] 5f³ 6d¹ 7s²",      group: 3,  period: 7, uses: "Nuclear power plant fuel providing low-carbon electricity. Used in military armor-piercing ammunition (depleted uranium)." },
  { atomicNumber: 93,  symbol: "Np",  name: "Neptunium",     mass: "(237)",   category: "actinide",         electronConfig: "[Rn] 5f⁴ 6d¹ 7s²",      group: 3,  period: 7, uses: "Neutron detection instruments for radiation monitoring. Used in research as a precursor to plutonium production." },
  { atomicNumber: 94,  symbol: "Pu",  name: "Plutonium",     mass: "(244)",   category: "actinide",         electronConfig: "[Rn] 5f⁶ 7s²",           group: 3,  period: 7, uses: "Nuclear weapons and reactor fuel. Used in radioisotope thermoelectric generators powering deep space probes like Voyager." },
  { atomicNumber: 95,  symbol: "Am",  name: "Americium",     mass: "(243)",   category: "actinide",         electronConfig: "[Rn] 5f⁷ 7s²",           group: 3,  period: 7, uses: "Smoke detectors in homes worldwide (americium-241). Used as a portable gamma ray source in industrial thickness gauges." },
  { atomicNumber: 96,  symbol: "Cm",  name: "Curium",        mass: "(247)",   category: "actinide",         electronConfig: "[Rn] 5f⁷ 6d¹ 7s²",      group: 3,  period: 7, uses: "Alpha particle X-ray spectrometers on Mars rovers for soil analysis. Used as a power source in space missions." },
  { atomicNumber: 97,  symbol: "Bk",  name: "Berkelium",     mass: "(247)",   category: "actinide",         electronConfig: "[Rn] 5f⁹ 7s²",           group: 3,  period: 7, uses: "Used only in scientific research to synthesize heavier transuranic elements. Has no known commercial applications." },
  { atomicNumber: 98,  symbol: "Cf",  name: "Californium",   mass: "(251)",   category: "actinide",         electronConfig: "[Rn] 5f¹⁰ 7s²",          group: 3,  period: 7, uses: "Neutron startup sources for nuclear reactors. Used in cancer treatment (brachytherapy) and detecting gold and silver ores." },
  { atomicNumber: 99,  symbol: "Es",  name: "Einsteinium",   mass: "(252)",   category: "actinide",         electronConfig: "[Rn] 5f¹¹ 7s²",          group: 3,  period: 7, uses: "Only used in scientific research for studying actinide chemistry. Named after Albert Einstein; first identified in hydrogen bomb debris." },
  { atomicNumber: 100, symbol: "Fm",  name: "Fermium",       mass: "(257)",   category: "actinide",         electronConfig: "[Rn] 5f¹² 7s²",          group: 3,  period: 7, uses: "Only used in scientific research; no practical applications. Named after Enrico Fermi; produced only in nuclear reactors." },
  { atomicNumber: 101, symbol: "Md",  name: "Mendelevium",   mass: "(258)",   category: "actinide",         electronConfig: "[Rn] 5f¹³ 7s²",          group: 3,  period: 7, uses: "Only used in scientific research to study actinide properties. Named after Dmitri Mendeleev, creator of the periodic table." },
  { atomicNumber: 102, symbol: "No",  name: "Nobelium",      mass: "(259)",   category: "actinide",         electronConfig: "[Rn] 5f¹⁴ 7s²",          group: 3,  period: 7, uses: "Only used in scientific research; extremely short half-life. Named after Alfred Nobel, founder of the Nobel Prizes." },
  { atomicNumber: 103, symbol: "Lr",  name: "Lawrencium",    mass: "(266)",   category: "actinide",         electronConfig: "[Rn] 5f¹⁴ 7s² 7p¹",     group: 3,  period: 7, uses: "Only used in scientific research to explore the limits of the periodic table. Named after Ernest O. Lawrence." },
  { atomicNumber: 104, symbol: "Rf",  name: "Rutherfordium", mass: "(267)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d² 7s²",     group: 4,  period: 7, uses: "Only used in scientific research; half-life of ~1 hour. Named after Ernest Rutherford; studied to understand transactinide chemistry." },
  { atomicNumber: 105, symbol: "Db",  name: "Dubnium",       mass: "(268)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d³ 7s²",     group: 5,  period: 7, uses: "Only used in scientific research; produces only a few atoms at a time. Named after Dubna, Russia." },
  { atomicNumber: 106, symbol: "Sg",  name: "Seaborgium",    mass: "(271)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d⁴ 7s²",     group: 6,  period: 7, uses: "Only used in scientific research to probe superheavy element properties. Named after Glenn T. Seaborg." },
  { atomicNumber: 107, symbol: "Bh",  name: "Bohrium",       mass: "(272)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d⁵ 7s²",     group: 7,  period: 7, uses: "Only used in scientific research; only a few atoms ever produced. Named after Niels Bohr." },
  { atomicNumber: 108, symbol: "Hs",  name: "Hassium",       mass: "(277)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d⁶ 7s²",     group: 8,  period: 7, uses: "Only used in scientific research. Named after the German state of Hesse; studied for chemical properties of element 108." },
  { atomicNumber: 109, symbol: "Mt",  name: "Meitnerium",    mass: "(278)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d⁷ 7s²",     group: 9,  period: 7, uses: "Only used in scientific research. Named after physicist Lise Meitner, who co-discovered nuclear fission." },
  { atomicNumber: 110, symbol: "Ds",  name: "Darmstadtium",  mass: "(281)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d⁸ 7s²",     group: 10, period: 7, uses: "Only used in scientific research; produced only in particle accelerators. Named after Darmstadt, Germany." },
  { atomicNumber: 111, symbol: "Rg",  name: "Roentgenium",   mass: "(282)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s¹",    group: 11, period: 7, uses: "Only used in scientific research. Named after Wilhelm Röntgen, discoverer of X-rays." },
  { atomicNumber: 112, symbol: "Cn",  name: "Copernicium",   mass: "(285)",   category: "transition-metal", electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s²",    group: 12, period: 7, uses: "Only used in scientific research; expected to be a gas at room temperature unlike other group 12 elements. Named after Copernicus." },
  { atomicNumber: 113, symbol: "Nh",  name: "Nihonium",      mass: "(286)",   category: "post-transition",  electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹", group: 13, period: 7, uses: "Only used in scientific research. First element discovered in Asia (Japan); named after Nihon (Japan)." },
  { atomicNumber: 114, symbol: "Fl",  name: "Flerovium",     mass: "(289)",   category: "post-transition",  electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²", group: 14, period: 7, uses: "Only used in scientific research; possibly a gas at room temperature. Named after Flerov Laboratory in Dubna, Russia." },
  { atomicNumber: 115, symbol: "Mc",  name: "Moscovium",     mass: "(290)",   category: "post-transition",  electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³", group: 15, period: 7, uses: "Only used in scientific research; produced only a few times. Named after Moscow Oblast, Russia." },
  { atomicNumber: 116, symbol: "Lv",  name: "Livermorium",   mass: "(293)",   category: "post-transition",  electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴", group: 16, period: 7, uses: "Only used in scientific research. Named after Lawrence Livermore National Laboratory in California." },
  { atomicNumber: 117, symbol: "Ts",  name: "Tennessine",    mass: "(294)",   category: "halogen",          electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵", group: 17, period: 7, uses: "Only used in scientific research; synthesized only a few times. Named after Tennessee, home of Oak Ridge National Laboratory." },
  { atomicNumber: 118, symbol: "Og",  name: "Oganesson",     mass: "(294)",   category: "noble-gas",        electronConfig: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶", group: 18, period: 7, uses: "Only used in scientific research; heaviest known element. Named after physicist Yuri Oganessian; may be a solid at room temperature." },
];

// Grid layout: [period, group] → gridRow, gridCol (1-indexed, CSS grid)
// Lanthanides row 9, Actinides row 10 in the display
function getGridPosition(el: Element): { row: number; col: number } | null {
  if (el.category === "lanthanide") {
    return { row: 9, col: el.atomicNumber - 54 }; // 57-71 → col 3-17
  }
  if (el.category === "actinide") {
    return { row: 10, col: el.atomicNumber - 86 }; // 89-103 → col 3-17
  }
  return { row: el.period, col: el.group };
}

export default function PeriodicTable() {
  const [selected, setSelected] = useState<Element | null>(null);
  const [search, setSearch] = useState("");

  const filteredNumbers = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    const matched = new Set(
      ELEMENTS.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.symbol.toLowerCase().includes(q)
      ).map((e) => e.atomicNumber)
    );
    return matched;
  }, [search]);

  function handleClick(el: Element) {
    setSelected((prev) => (prev?.atomicNumber === el.atomicNumber ? null : el));
  }

  return (
    <div className="min-h-screen bg-surface p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold">Periodic Table Explorer</h1>
          <p className="text-muted text-sm">Click any element for details</p>
        </div>
        <div className="sm:ml-auto">
          <input
            type="text"
            placeholder="Search by name or symbol…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-accent"
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(CATEGORY_COLORS) as [Category, typeof CATEGORY_COLORS[Category]][]).map(([cat, colors]) => (
          <span
            key={cat}
            className={`text-xs px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}
          >
            {colors.label}
          </span>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className={`rounded-2xl border p-4 ${CATEGORY_COLORS[selected.category].bg} ${CATEGORY_COLORS[selected.category].border}`}>
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-20 h-20 rounded-xl flex flex-col items-center justify-center border-2 ${CATEGORY_COLORS[selected.category].border} bg-white/60`}>
              <span className="text-xs text-muted">{selected.atomicNumber}</span>
              <span className="text-3xl font-bold leading-tight">{selected.symbol}</span>
              <span className="text-xs font-medium">{selected.mass}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{selected.name}</h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[selected.category].bg} ${CATEGORY_COLORS[selected.category].text} ${CATEGORY_COLORS[selected.category].border}`}>
                  {CATEGORY_COLORS[selected.category].label}
                </span>
              </div>
              <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-sm">
                <div>
                  <dt className="text-muted text-xs">Atomic Number</dt>
                  <dd className="font-mono font-semibold">{selected.atomicNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Atomic Mass</dt>
                  <dd className="font-mono font-semibold">{selected.mass}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Group / Period</dt>
                  <dd className="font-mono font-semibold">{selected.group} / {selected.period}</dd>
                </div>
                <div>
                  <dt className="text-muted text-xs">Electron Config</dt>
                  <dd className="font-mono font-semibold">{selected.electronConfig}</dd>
                </div>
              </dl>
              <p className="mt-2 text-sm">{selected.uses}</p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="flex-shrink-0 text-muted hover:text-foreground text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <div
          className="grid gap-0.5"
          style={{
            gridTemplateColumns: "repeat(18, minmax(44px, 1fr))",
            gridTemplateRows: "repeat(10, auto)",
            minWidth: "800px",
          }}
        >
          {ELEMENTS.map((el) => {
            const pos = getGridPosition(el);
            if (!pos) return null;
            const colors = CATEGORY_COLORS[el.category];
            const isSelected = selected?.atomicNumber === el.atomicNumber;
            const isDimmed = filteredNumbers !== null && !filteredNumbers.has(el.atomicNumber);

            return (
              <button
                key={el.atomicNumber}
                onClick={() => handleClick(el)}
                title={el.name}
                style={{ gridRow: pos.row, gridColumn: pos.col }}
                className={[
                  "flex flex-col items-center justify-center rounded p-0.5 border transition-all cursor-pointer",
                  "hover:scale-110 hover:z-10 hover:shadow-md",
                  colors.bg,
                  colors.border,
                  isSelected ? "ring-2 ring-offset-1 ring-primary scale-110 z-10 shadow-md" : "",
                  isDimmed ? "opacity-20" : "",
                ].join(" ")}
              >
                <span className={`text-[9px] leading-none ${colors.text} opacity-70`}>{el.atomicNumber}</span>
                <span className={`text-sm font-bold leading-tight ${colors.text}`}>{el.symbol}</span>
                <span className={`text-[8px] leading-none truncate w-full text-center ${colors.text} opacity-80`}>{el.name}</span>
              </button>
            );
          })}

          {/* Gap label row for lanthanides/actinides */}
          <div
            style={{ gridRow: 6, gridColumn: 3 }}
            className="flex items-center justify-center text-[9px] text-muted"
            title="Lanthanides (57-71) shown below"
          >
            57-71
          </div>
          <div
            style={{ gridRow: 7, gridColumn: 3 }}
            className="flex items-center justify-center text-[9px] text-muted"
            title="Actinides (89-103) shown below"
          >
            89-103
          </div>

          {/* Row labels for f-block */}
          <div style={{ gridRow: 9, gridColumn: 1 }} className="flex items-center justify-end pr-1">
            <span className="text-[9px] text-muted rotate-0 whitespace-nowrap">La</span>
          </div>
          <div style={{ gridRow: 10, gridColumn: 1 }} className="flex items-center justify-end pr-1">
            <span className="text-[9px] text-muted whitespace-nowrap">Ac</span>
          </div>
        </div>
      </div>

      {/* Ad placeholder */}
      <div className="rounded-2xl border border-border bg-surface flex items-center justify-center h-20 text-muted text-sm">
        Advertisement
      </div>
    
      {/* FAQ */}
      <section className="mt-12 space-y-4">
        <h2 className="text-lg font-bold text-gray-800">Frequently Asked Questions</h2>
        <div className="space-y-3">
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">What does this Periodic Table Explorer tool do?</summary>
      <p className="mt-2 text-sm text-gray-600">Interactive periodic table with element details on click. Just enter your values and get instant results.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">Is this tool free to use?</summary>
      <p className="mt-2 text-sm text-gray-600">Yes, completely free. No sign-up or account required.</p>
    </details>
    <details className="bg-gray-50 rounded-lg p-4 open:bg-gray-100">
      <summary className="font-medium text-gray-700 cursor-pointer select-none">How accurate are the results?</summary>
      <p className="mt-2 text-sm text-gray-600">Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional.</p>
    </details>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "What does this Periodic Table Explorer tool do?", "acceptedAnswer": {"@type": "Answer", "text": "Interactive periodic table with element details on click. Just enter your values and get instant results."}}, {"@type": "Question", "name": "Is this tool free to use?", "acceptedAnswer": {"@type": "Answer", "text": "Yes, completely free. No sign-up or account required."}}, {"@type": "Question", "name": "How accurate are the results?", "acceptedAnswer": {"@type": "Answer", "text": "Results are estimates based on standard formulas. For critical decisions, please consult a qualified professional."}}]})}} />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Periodic Table Explorer",
  "description": "Interactive periodic table with element details on click",
  "url": "https://tools.loresync.dev/periodic-table",
  "applicationCategory": "UtilityApplication",
  "operatingSystem": "All",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY"
  },
  "inLanguage": "en"
}`
        }}
      />
      </div>
  );
}
