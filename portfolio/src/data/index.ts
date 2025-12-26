import { Project } from '../types';

export type ProjectCategory = 'research/computation' | 'architectural design';

// Helper function to get all media files for a project
export function getProjectMedia(projectId: string): string[] {
  // This will be populated based on the file structure: p{id}-{index}.{ext}
  const mediaMap: Record<string, string[]> = {
    'p1': ['/images/projects/p1-1.mp4', '/images/projects/p1-2.png', '/images/projects/p1-3.png', '/images/projects/p1-4.png', '/images/projects/p1-5.JPG', '/images/projects/p1-6.png', '/images/projects/p1-7.png', '/images/projects/p1-8.png'],
    'p2': ['/images/projects/p2-1.jpg', '/images/projects/p2-2.png', '/images/projects/p2-3.jpg', '/images/projects/p2-4.jpg', '/images/projects/p2-5.jpg', '/images/projects/p2-6.jpg'],
    'p3': ['/images/projects/p3-1.mp4', '/images/projects/p3-2.png', '/images/projects/p3-3.jpg', '/images/projects/p3-4.mp4', '/images/projects/p3-5.png', '/images/projects/p3-6.png', '/images/projects/p3-7.png', '/images/projects/p3-8.jpg', '/images/projects/p3-9.jpg'],
    'p4': ['/images/projects/p4-1.png', '/images/projects/p4-2.png', '/images/projects/p4-3.png', '/images/projects/p4-4.png', '/images/projects/p4-5.png'],
    'p5': ['/images/projects/p5-1.png', '/images/projects/p5-2.png', '/images/projects/p5-3.png', '/images/projects/p5-4.png', '/images/projects/p5-5.png', '/images/projects/p5-6.png', '/images/projects/p5-7.png', '/images/projects/p5-8.png'],
    'p6': ['/images/projects/p6-1.png', '/images/projects/p6-2.png'],
    'p7': ['/images/projects/p7-1.jpg', '/images/projects/p7-2.png', '/images/projects/p7-3.png', '/images/projects/p7-4.png'],
    'p8': ['/images/projects/p8-1.png', '/images/projects/p8-2.jpg', '/images/projects/p8-3.jpg'],
    'p9': ['/images/projects/p9-1.png', '/images/projects/p9-2.png', '/images/projects/p9-3.png'],
    'p10': ['/images/projects/p10-1.jpg', '/images/projects/p10-2.jpg', '/images/projects/p10-3.jpg'],
  };

  return mediaMap[projectId] || [];
}

export const projects: (Project & { category: ProjectCategory })[] = [
  {
    id: 'p1',
    title: 'shodō desk.',
    shortDescription: 'An installation that translates interpersonal exchanges into public traces',
    thumbnail: '/images/projects/p1-1.png',
    tags: ['Installation', 'Design', 'Interactive'],
    category: 'research/computation',
    content: {
      description: 'Shodō Trace is an interactive installation that transposes the contemplative discipline of Japanese calligraphy into a computational instrument for social memory. During the fleeting interval of a coffee break, bodies drift, pause, and orbit—movements that ordinarily evaporate without residue. Here, they are sensed, abstracted, and inscribed.',
      role: 'Individual Work',
      technologies: ['Arduino', 'Python'],
    }
  },
  {
    id: 'p2',
    title: 'branch+',
    shortDescription: 'Drone-based high-precision scanning and clay 3D printing',
    thumbnail: '/images/projects/p2-1.jpg',
    tags: ['Computational', 'Parametric', 'Fabrication'],
    category: 'research/computation',
    content: {
      description: 'Experimenting start&stop techniques in 3D clay printing to create innovative building components.',
      role: 'Group Work',
      technologies: ['Grasshopper', 'Python', '3D Clay Printing'],
    }
  },
  {
    id: 'p3',
    title: 'building as agent.',
    shortDescription: 'Research on how buildings can adapt and regenerate through AI-driven systems',
    thumbnail: '/images/projects/p3-1.mp4',
    tags: ['Urban', 'Algorithms', 'AI'],
    category: 'research/computation',
    content: {
      description: 'This project investigates an AI-driven architectural system that enables existing buildings to sense, simulate, and autonomously reconfigure underused spaces through agent-based decision-making and modular interventions, transforming traditional highrise office into adaptive, self-iterative environments.',
      role: 'Individual Work',
      technologies: ['Arduino', 'Grasshopper', 'Python'],
    }
  },
  {
    id: 'p4',
    title: 'cityone.',
    shortDescription: 'Research on lightweight, low-surveillance public participation in urban planning',
    thumbnail: '/images/projects/p4-1.png',
    tags: ['Urban', 'Big Data', 'Algorithms'],
    category: 'research/computation',
    content: {
      description: 'CityOne is a lightweight public-participation system for urban planning. By letting people speak a single sentence about their everyday urban experience, the system converts subjective feelings and concrete observations into structured “city cards” through a dual-channel algorithm. These cards surface shared concerns and minority voices, and translate them into small, testable urban interventions—bridging everyday experience and data-driven decision-making with minimal surveillance and effort.',
      role: 'Individual Work',
      technologies: ['App Development', 'Python'],
    }
  },
  {
    id: 'p5',
    title: 'cityrefit.',
    shortDescription: 'Research on an evidence-driven, human–AI workflow for spatial reconfiguration',
    thumbnail: '/images/projects/p5-1.png',
    tags: ['Urban', 'Machine Learning', 'AI'],
    category: 'research/computation',
    content: {
      description: 'This project prototypes an evidence-driven, reproducible human–AI workflow for spatial reconfiguration: multi-source urban data is formalized as generative constraints to batch-synthesize alternatives, then calibrated via an immersive/behavioral feedback loop. A CBD parking-reuse pilot demonstrates the workflow’s transferability and robustness across contexts, with deliverables including a workflow playbook, a metric-to-constraint dictionary, and a decision kit.',
      role: 'Individual Work',
      technologies: ['ComfyUI', 'ArcGIS'],
    }
  },
  {
    id: 'p6',
    title: 'chile aerospace research institute.',
    shortDescription: 'Public building design',
    thumbnail: '/images/projects/p6-1.png',
    tags: ['architecture design'],
    category: 'architectural design',
    content: {
      description: 'Set on the barren coastal plateau of Taltal, northern Chile, where the desert meets the Pacific and conditions echo the extremity of extraterrestrial terrains, this experimental aerospace facility operates at the threshold between Earth and the cosmos. Conceived for the testing and fabrication of advanced aerospace equipment, the project embodies humanity’s ambition to transcend terrestrial ',
      role: 'Individual Work',
      technologies: ['Rhino', 'Fabrication'],
    }
  },
  {
    id: 'p7',
    title: 'beneath the gantry.',
    shortDescription: 'Residential design + Public building design',
    thumbnail: '/images/projects/p7-1.jpg',
    tags: ['architecture design'],
    category: 'architectural design',
    content: {
      description: 'Located in Brunswick along the Upfield corridor, the Micro-Workshop Tower offers a vertical prototype for affordable production and living. Lower levels host flexible light-industrial bays and shared workshops, while the middle floors cluster small independent studios. Above, compact live–work units integrate residential space with individual workrooms, supporting artisans and start-ups within the same footprint. A galvanized steel exoskeleton and precast slabs create adaptable, column-free interiors, while recycled brick, translucent polycarbonate, and perforated aluminum ',
      role: 'Individual Work',
      technologies: ['Rhino', 'Fabrication', 'Vray'],
    }
  },
  {
    id: 'p8',
    title: 'the elevation.',
    shortDescription: 'Public building design',
    thumbnail: '/images/projects/p8-1.png',
    tags: ['architecture design'],
    category: 'architectural design',
    content: {
      description: 'The Old Engineering Building is reimagined as elevation: a fragment of façade lifted skyward as memory and horizon. A Vierendeel truss and prestressed spines suspend a flexible deck, anchored by service cores and struts. A porous plinth connects campus paths, labs rise above, and the preserved façade glows at dusk. Recycled aluminum and carbon-fiber make the structure reversible—history raised, continuity reimagined.',
      role: 'Individual Work',
      technologies: ['Rhino', 'Fabrication', 'Vray'],
    }
  },
  {
    id: 'p9',
    title: 'gallery+conference.',
    shortDescription: 'Gallery design',
    thumbnail: '/images/projects/p9-1.png',
    tags: ['architecture design'],
    category: 'architectural design',
    content: {
      description: 'Situated between the converging rail lines of Melbourne’s Docklands Station, this exhibition and convention pavilion emerges as a landmark for the city’s newest waterfront precinct. Suspended grey aluminium panels sheath its surface, while the building’s fractured, interlocking volumes evoke the abstract dynamism of Umberto Boccioni’s Futurist sculptures. The form captures the velocity, tension, and mechanical energy of the surrounding rail corridors, translating infrastructural motion into an architectural icon that anchors Docklands as both cultural gateway and civic stage.',
      role: 'Individual Work',
      technologies: ['Rhino', 'Fabrication'],
    }
  },
  {
    id: 'p10',
    title: 'the veil works.',
    shortDescription: 'Factory design',
    thumbnail: '/images/projects/p10-1.jpg',
    tags: ['architecture design'],
    category: 'architectural design',
    content: {
      description: 'In South Gippsland’s grasslands, the center rises as a steel grid wrapped in translucent polycarbonate, softening light and noise. A spiral stair frees the core, with flexible industrial floors above and a civic ground plane below, opening to the meadow. Industry and community converge as both machine and pavilion, a prototype for peri-urban regeneration.',
      role: 'Individual Work',
      technologies: ['Rhino', 'Fabrication', 'Vray'],
    }
  }
];

export const profileData = {
  name: 'Roma(Ma) Luo',
  title: 'Architectural / Computational Designer',
  intro: 'Exploring the intersection of architecture and digital interaction.',
  education: [
    {
      school: 'University of Melbourne',
      degree: 'Master of Architecture',
      year: '2023 - 2025'
    },
    {
      school: 'University of Tokyo',
      degree: 'Exchange Research Student',
      year: '2024 - 2025'
    },
    {
      school: 'Monash University',
      degree: 'Bachelor of Architecture',
      year: '2019 - 2023'
    }
  ],
  skills: {
    'Design & Modeling': ['Rhino', 'Revit', 'AutoCAD', 'Adobe Creative Suite', 'Vray for Rhino'],
    'Computation & Code': ['Grasshopper', 'Python', 'C#', 'Java', 'TypeScript', 'React', 'HTML+CSS'],
    'Advanced Tech': ['Unity Engine', 'Arduino', 'ComfyUI', 'Fabrication', 'ArcGIS', 'QGIS']
  }
};

export const experienceData = [
  {
    role: 'Architectural Designer',
    company: 'junya.ishigami+associates',
    period: '2025.06 - Present',
    description: 'Project Manager for large-scale international projects.'
  },
  {
    role: 'Architectural Intern',
    company: 'The Oval Partnership Ltd',
    period: '2024.07 - 2024.10',
    description: 'Specialized in parametric modeling and environmental analysis.'
  },
  {
    role: 'Architectural Intern',
    company: 'HASSELL',
    period: '2024.01 - 2024.03',
    description: 'Collaborated on competition-winning proposals for public infrastructure.'
  },
  {
    role: 'Architectural Intern',
    company: 'P&T Architects and Engineers Ltd',
    period: '2023.12 - 2024.01',
    description: 'Assisted in 3D modeling and visualization for client presentations.'
  },
  {
    role: 'Architectural Intern',
    company: 'RPtecture™ Architecture',
    period: '2020.02 - 2020.04',
    description: 'Assisted in concept development and physical model making. Produced visualization assets for client presentations.'
  }
];
