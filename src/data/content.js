// The layout is typographic, so the only images it needs are the project
// screenshots. The service, company and tech logos in src/assets are no longer
// imported and so are no longer bundled.
import work1 from '../assets/work-1.png'
import work2 from '../assets/work-2.png'
import work3 from '../assets/work-3.png'

export const profile = {
  name: 'Anubhav Raj',
  role: 'Founding Software Developer',
  tagline: 'I develop user interfaces and web applications',
  email: 'anubhav.27.april@gmail.com',
  github: 'https://github.com/anubhavRaj27',
  intro:
    "I'm a skilled software developer with experience in TypeScript and JavaScript, and expertise in frameworks like React and Next.js. I'm a quick learner and collaborate closely with clients to create efficient, scalable, and user-friendly solutions that solve real-world problems. Let's work together to bring your ideas to life!",
  location: 'India',
  availability: 'Available for work',
}

export const contactLinks = [
  { label: 'Email', value: 'anubhav.27.april@gmail.com', href: 'mailto:anubhav.27.april@gmail.com' },
  { label: 'GitHub', value: 'github.com/anubhavRaj27', href: 'https://github.com/anubhavRaj27' },
]

export const services = [
  { title: 'Web Developer' },
  { title: 'React Developer' },
  { title: 'User Interface Developer' },
  { title: 'Automation Testing' },
]

// Derived from the experience and project data below, so nothing here is a
// claim that the rest of the page does not already back up.
export const stats = [
  { value: '2+', label: 'Years shipping product' },
  { value: '11', label: 'Technologies in rotation' },
  { value: '3', label: 'Featured projects' },
]

export const techGroups = [
  {
    title: 'Frontend',
    subtitle: 'Interface engineering',
    items: ['React JS', 'TypeScript', 'JavaScript', 'Redux Toolkit', 'Tailwind CSS', 'Three JS'],
  },
  {
    title: 'Backend',
    subtitle: 'Systems and APIs',
    items: ['Node JS', 'MongoDB', 'REST APIs'],
  },
  {
    title: 'Craft',
    subtitle: 'Markup and workflow',
    items: ['HTML 5', 'CSS 3', 'Styled Components', 'Cypress', 'git'],
  },
]

export const experiences = [
  {
    title: 'Founding Software Developer',
    company: 'DecoverHq',
    date: 'July 2024 - Current',
    points: [
      'Developed and maintained frontend architecture using React.js and Styled Components with a focus on scalability and performance.',
      'Led the creation of an in-house file upload system, eliminating third-party dependency and improving security and efficiency.',
      'Built a real-time collaborative rich text editor using Tiptap, enabling features like commenting and formatting.',
      'Developed an internal dashboard for user data visualization and admin configuration management, replacing Swagger-based edits.',
      'Implemented Cypress for end-to-end testing and improved load times by 60% using lazy loading and code splitting.',
      'Worked closely with backend engineers and designers to deliver a cohesive and user-friendly product experience.',
    ],
  },
  {
    title: 'Frontend Intern',
    company: 'DecoverHq',
    date: 'Feb 2024 - July 2024',
    points: [
      'Built modular and reusable UI components using React.js and Styled Components to ensure scalability and design consistency.',
      'Integrated multiple RESTful APIs to fetch and render dynamic data across the application.',
      'Implemented interactive charts and network graphs using Highcharts for better data visualization.',
      'Gained hands-on experience in collaborative development and contributed to delivering production-ready features.',
    ],
  },
]

export const projects = [
  {
    name: 'Vibe Vista',
    description:
      'A vibrant social media platform powered by the MERN stack, enabling users worldwide to connect, share, and engage through a seamless, responsive experience.',
    tags: ['react', 'mongodb', 'css'],
    image: work1,
    link: 'https://github.com/anubhavRaj27/socialMedia',
  },
  {
    name: 'Image Search',
    description:
      'A web platform offering hundreds of related pictures for projects, where users enter a keyword to instantly fetch desired images via an external API.',
    tags: ['HTML', 'restapi', 'css'],
    image: work2,
    link: 'https://github.com/anubhavRaj27/image_search',
  },
  {
    name: 'Study Sync',
    description:
      'A web platform that allows students to watch educational YouTube courses, save playlists and track progress, similar to a paid course platform.',
    tags: ['React', 'YouTubeDataAPI', 'MUI'],
    image: work3,
    link: 'https://github.com/sourabhjo7/StudySync-Hackout',
  },
]
