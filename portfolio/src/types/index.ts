export interface Project {
  id: string;
  title: string;
  shortDescription: string;
  thumbnail?: string;
  tags: string[];
  category?: 'research/computation' | 'architectural design';
  content?: {
    description: string;
    role: string;
    technologies: string[];
    images?: string[];
  };
}

export type WindowType = 'project' | 'profile' | 'contact' | 'awards' | 'experience' | 'location';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isExpanded: boolean; // New state for "expanded" view
  zIndex: number;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  type: WindowType;
  projectId?: string; // Links to project data if type is 'project'
}

export interface Position {
  x: number;
  y: number;
}
