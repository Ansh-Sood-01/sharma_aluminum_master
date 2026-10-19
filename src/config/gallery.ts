export type GalleryItem = {
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
  position?: string;
  mediaType?: "image" | "video";
  alt?: string;
};

export type GalleryCategory = {
  slug: string;
  eyebrow: string;
  title: string;
  intro: string;
  items: GalleryItem[];
};

const photo = (id: string, width = 1400) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
const ref = (title: string, description: string, imageId: string, tag: string, position?: string): GalleryItem => ({ title, description, imageUrl: photo(imageId), tag, position, mediaType: "image", alt: `${title} — reference image` });

/** Demo visuals are clearly labelled reference inspiration, not completed company projects. */
export const galleryCategories: GalleryCategory[] = [
  {
    slug: "kitchens-cabinetry", eyebrow: "01 / MADE FOR EVERYDAY LIVING", title: "Kitchens & cabinetry",
    intro: "Explore kitchen layouts, cupboards, almirahs and considered storage ideas. Save a reference you like, then discuss sizes, finishes and hardware with the team.",
    items: [
      ref("Contemporary kitchen finish", "A reference for clean cabinetry lines and a calm, neutral palette.", "photo-1600566753086-00f18fb6b3ea", "Kitchen"),
      ref("Warm modern cabinetry", "A reference for storage proportions and coordinated finishes.", "photo-1600607687939-ce8a6c25118c", "Cabinetry"),
      ref("Built-in storage inspiration", "Ideas for making the most of a wall or compact corner.", "photo-1600566753190-17f0baa2a6c3", "Storage"),
      ref("Minimal interior detailing", "A simple direction for a modern and uncluttered finish.", "photo-1600607687920-4e2a09cf159d", "Modern"),
      ref("Material and colour pairing", "A reference for pairing surfaces, frame colours and lighting.", "photo-1600607687644-c7171b42498f", "Finishes"),
      ref("Premium living space", "A reference for a coordinated cabinetry and interior look.", "photo-1600585154340-be6161a56a0c", "Premium"),
    ],
  },
  {
    slug: "cupboards-almirahs", eyebrow: "02 / STORAGE, CONSIDERED", title: "Cupboards & almirahs",
    intro: "Explore references for wardrobes, aluminium cupboards and practical storage systems. Final dimensions, colours and internal layouts should be discussed with the team.",
    items: [
      ref("Built-in wardrobe reference", "A reference for clean, full-height storage.", "photo-1616486338812-3dadae4b4ace", "Wardrobes"),
      ref("Minimal storage wall", "A reference for a calm, aligned finish.", "photo-1600607687920-4e2a09cf159d", "Storage"),
      ref("Warm wood and neutral tones", "A reference for combining textures and hardware.", "photo-1600607687939-ce8a6c25118c", "Finishes"),
      ref("Modern bedroom cabinetry", "A reference for coordinating storage with a room.", "photo-1615874694520-474822394e73", "Bedroom"),
    ],
  },
  {
    slug: "doors", eyebrow: "03 / OPENINGS WITH PURPOSE", title: "Aluminium doors",
    intro: "Browse door and frame inspiration for residential and commercial spaces. The right configuration depends on opening size, use and the selected system.",
    items: [
      ref("Contemporary glazed entrance", "A reference for a bright entrance with a simple frame.", "photo-1600607687920-4e2a09cf159d", "Entrance"),
      ref("Modern sliding door", "A reference for connecting indoor and outdoor spaces.", "photo-1600585154340-be6161a56a0c", "Sliding"),
      ref("Dark frame detailing", "A reference for a stronger architectural outline.", "photo-1600607687644-c7171b42498f", "Frame"),
      ref("Glazed interior opening", "A reference for light and visual continuity.", "photo-1600607688969-a5bfcd646154", "Interior"),
    ],
  },
  {
    slug: "windows", eyebrow: "04 / FRAMES THAT SHAPE THE VIEW", title: "Windows & frames",
    intro: "Browse window and frame-system references for homes, balconies and workspaces. Every opening is different, so the final design and dimensions should be confirmed with the team.",
    items: [
      ref("Full-height glazed opening", "A reference for bringing daylight into a living space.", "photo-1600607687939-ce8a6c25118c", "Large opening", "center"),
      ref("Modern exterior window", "A reference for a crisp frame against an architectural facade.", "photo-1600585154340-be6161a56a0c", "Exterior"),
      ref("Window and interior connection", "A reference for light, views and a clean interior finish.", "photo-1600607687920-4e2a09cf159d", "Residential"),
      ref("Contemporary frame detailing", "A reference for modern openings and understated materials.", "photo-1600607687644-c7171b42498f", "Frame detail"),
      ref("Bright room glazing", "A reference for windows in a calm, daylight-filled room.", "photo-1600566753190-17f0baa2a6c3", "Daylight"),
      ref("Architectural glass and frame", "A reference for combining glazing with strong straight lines.", "photo-1600607688969-a5bfcd646154", "Glass & frame"),
      ref("Modern home design", "A reference for matching frames to the wider facade.", "photo-1600566753788-8b14f9e3f2f7", "Facade"),
      ref("Interior window inspiration", "A reference for openings that define a space.", "photo-1600607687920-4e2a09cf159d", "Interior"),
    ],
  },
  {
    slug: "sheets-panels", eyebrow: "05 / SURFACE AND STRUCTURE", title: "Aluminium sheets & panels",
    intro: "Explore surface, cladding and panel inspiration for interiors and practical installations. Material thickness, finish and application are confirmed per requirement.",
    items: [
      ref("Linear panel rhythm", "A reference for aligned panels and shadow lines.", "photo-1600607687644-c7171b42498f", "Panels"),
      ref("Metal and stone contrast", "A reference for mixing cool and warm surfaces.", "photo-1600607687939-ce8a6c25118c", "Material"),
      ref("Clean commercial finish", "A reference for restrained surfaces in a modern workspace.", "photo-1497366754035-f200968a6e72", "Commercial"),
      ref("Architectural detail study", "A reference for balanced proportions and surface changes.", "photo-1600607688969-a5bfcd646154", "Detail"),
    ],
  },
  {
    slug: "commercial-interiors", eyebrow: "06 / BUILT FOR WORK", title: "Office & commercial interiors",
    intro: "Explore office fittings, partitions, counters and other commercial interior references. Tell us about your space, workflow and finish preferences to begin planning.",
    items: [
      ref("Modern workspace", "A reference for a composed, light-filled work environment.", "photo-1497366754035-f200968a6e72", "Workspace"),
      ref("Glass meeting room", "A reference for visually connected work zones.", "photo-1497366216548-37526070297c", "Partitions"),
      ref("Reception and front desk", "A reference for a neat customer-facing area.", "photo-1497366811353-6870744d04b2", "Reception"),
      ref("Contemporary office detail", "A reference for materials and finish coordination.", "photo-1497366811353-6870744d04b2", "Interior"),
    ],
  },
  {
    slug: "racks-storage", eyebrow: "07 / STORAGE THAT WORKS", title: "Racks & storage solutions",
    intro: "Browse storage inspiration for homes, shops and work areas. The right layout depends on load, available space and what needs to be stored.",
    items: [
      ref("Open storage system", "A reference for easy-access display and storage.", "photo-1600607687939-ce8a6c25118c", "Open storage"),
      ref("Utility storage zone", "A reference for using vertical space efficiently.", "photo-1600566753190-17f0baa2a6c3", "Utility"),
      ref("Retail shelving inspiration", "A reference for orderly product presentation.", "photo-1497366754035-f200968a6e72", "Retail"),
      ref("Minimal storage cabinetry", "A reference for reducing visual clutter.", "photo-1616486338812-3dadae4b4ace", "Cabinetry"),
    ],
  },
  {
    slug: "gates-grills-fabrication", eyebrow: "08 / MADE TO FIT", title: "Gates, grills & fabrication",
    intro: "Explore practical fabrication references for gates, grill patterns and custom metalwork. Discuss site conditions, measurements and intended use before selecting a design.",
    items: [
      ref("Linear architectural screening", "A reference for repeated vertical lines.", "photo-1600585154340-be6161a56a0c", "Screening"),
      ref("Modern facade detail", "A reference for integrating metalwork into an exterior.", "photo-1600607687644-c7171b42498f", "Facade"),
      ref("Geometric design direction", "A reference for clean, geometric proportions.", "photo-1600607688969-a5bfcd646154", "Geometry"),
      ref("Contemporary entry design", "A reference for a simple and modern entrance.", "photo-1600607687920-4e2a09cf159d", "Entrance"),
    ],
  },
  {
    slug: "glass-partitions", eyebrow: "09 / TRANSPARENCY AND LIGHT", title: "Glass work & partitions",
    intro: "Explore glass partitions and combinations with aluminium frames for homes, offices and retail spaces. Safety, dimensions and hardware should be assessed for each installation.",
    items: [
      ref("Slim-profile glass partition", "A reference for transparency and a restrained frame.", "photo-1600607688969-a5bfcd646154", "Partitions"),
      ref("Framed meeting space", "A reference for separating spaces while retaining light.", "photo-1497366216548-37526070297c", "Office"),
      ref("Glass and warm finishes", "A reference for balancing glass with warm materials.", "photo-1600607687939-ce8a6c25118c", "Finish"),
      ref("Interior glazing detail", "A reference for calm lines and clean junctions.", "photo-1600607687644-c7171b42498f", "Detail"),
      ref("Light-filled partition", "A reference for open-plan visual continuity.", "photo-1497366811353-6870744d04b2", "Open plan"),
    ],
  },
  {
    slug: "premium-collection", eyebrow: "10 / MATERIAL, LIGHT, DETAIL", title: "Premium collection",
    intro: "A dedicated collection for glass and aluminium combinations, profile lighting, refined kitchens, modern partitions and considered interior details.",
    items: [
      ref("Glass, frame and light", "A reference for premium material combinations.", "photo-1600607687644-c7171b42498f", "Premium"),
      ref("Architectural interior", "A reference for a cohesive interior language.", "photo-1600607687939-ce8a6c25118c", "Interior"),
      ref("Modern kitchen composition", "A reference for carefully balanced finishes.", "photo-1600566753086-00f18fb6b3ea", "Kitchen"),
      ref("Refined material palette", "A reference for understated tones and detail.", "photo-1600607688969-a5bfcd646154", "Materials"),
    ],
  },
];

export function getGalleryCategory(slug: string) {
  return galleryCategories.find((category) => category.slug === slug);
}
