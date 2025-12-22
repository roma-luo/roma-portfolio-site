const fs = require('fs');
const path = require('path');

const projectsDir = path.join(__dirname, '../public/images/project_images');
const outputFile = path.join(__dirname, '../src/data/index.ts');

// Helper to parse the custom text format
function parseIntroTxt(content) {
  const result = {
    content: {}
  };
  
  // Basic parsing logic
  // Note: This relies on the specific format provided by the user
  const lines = content.split('\n');
  let currentSection = 'root';
  
  lines.forEach(line => {
    line = line.trim();
    if (!line || line === '}') return;
    
    if (line.includes('content: {')) {
      currentSection = 'content';
      return;
    }

    // Extract key-value pairs
    // Matches: key: 'value', or key: ['val1', 'val2']
    const match = line.match(/(\w+):\s*(.+)/);
    if (match) {
      const key = match[1];
      let value = match[2];
      
      // Remove trailing comma
      if (value.endsWith(',')) value = value.slice(0, -1);
      
      // Parse arrays
      if (value.startsWith('[') && value.endsWith(']')) {
        try {
           // Replace single quotes with double quotes for JSON.parse
           // And handle potential escaped quotes
           const arrayStr = value.replace(/'/g, '"');
           value = JSON.parse(arrayStr);
        } catch (e) {
           console.warn(`Failed to parse array for ${key}: ${value}`);
           value = [];
        }
      } else if (value.startsWith("'") && value.endsWith("'")) {
        // Remove quotes
        value = value.slice(1, -1);
      }
      
      if (currentSection === 'root') {
        result[key] = value;
      } else {
        result.content[key] = value;
      }
    }
  });
  
  return result;
}

function generateData() {
  if (!fs.existsSync(projectsDir)) {
    console.error('Project images directory not found!');
    return;
  }

  const folders = fs.readdirSync(projectsDir).filter(file => {
    return fs.statSync(path.join(projectsDir, file)).isDirectory();
  });

  const projects = folders.map(folder => {
    const folderPath = path.join(projectsDir, folder);
    const files = fs.readdirSync(folderPath);
    
    // Get intro.txt
    const introFile = files.find(f => f === 'intro.txt');
    let projectData = {};
    
    if (introFile) {
      const content = fs.readFileSync(path.join(folderPath, introFile), 'utf-8');
      projectData = parseIntroTxt(content);
    }
    
    // Get images/videos
    const mediaFiles = files.filter(f => 
      ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.mp4'].includes(path.extname(f).toLowerCase())
    ).sort((a, b) => {
      // Sort numerically (1.jpg, 2.jpg)
      const numA = parseInt(a.split('.')[0]);
      const numB = parseInt(b.split('.')[0]);
      return numA - numB;
    });

    // Construct public paths
    const images = mediaFiles.map(f => `/images/project_images/${folder}/${f}`);
    
    // Default fallback if ID/Title missing
    if (!projectData.id) projectData.id = folder;
    if (!projectData.title) projectData.title = folder.replace(/_/g, ' ');
    if (!projectData.tags) projectData.tags = [];
    if (!projectData.content.technologies) projectData.content.technologies = [];
    
    // Assign images
    projectData.thumbnail = images[0]; // First image is thumbnail
    projectData.content.images = images; // All images in gallery

    return projectData;
  });

  // Construct the file content
  const fileContent = `import { Project } from '../types';

export const projects: Project[] = ${JSON.stringify(projects, null, 2)};

export const profileData = {
  name: 'Roma Luo',
  title: 'Architect / Computational Designer',
  intro: 'Exploring the intersection of physical space and digital interaction.',
  education: [
    {
      school: 'University of Architecture',
      degree: 'Master of Architecture',
      year: '2023'
    }
  ],
  skills: ['Rhino', 'Grasshopper', 'React', 'TypeScript', 'Python', 'Unity']
};
`;

  fs.writeFileSync(outputFile, fileContent);
  console.log(`Successfully generated data for ${projects.length} projects!`);
}

generateData();

