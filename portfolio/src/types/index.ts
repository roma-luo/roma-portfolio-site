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
  };
}

export type WindowType = 'project' | 'profile' | 'contact' | 'awards' | 'experience' | 'location' | 'miniWindow';

export interface WindowState {
  id: string;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  zIndex: number;
  position: { x: number; y: number };
  preExpandPosition?: { x: number; y: number }; // Saved position before expansion, for restore on collapse
  size?: { width: number; height: number };
  type: WindowType;
  projectId?: string; // Links to project data if type is 'project'
  parentProjectId?: string; // For miniWindow: links to parent project
  mediaSrc?: string; // For miniWindow: the single media file to display
}
