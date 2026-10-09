// Edit this file to maintain the website's text, links, and project order.
// Venue/status wording follows the owner's 2026-10-08 resume.
export const profile = {
  name: 'Jialu Xu',
  introduction: 'I am a MASc student in Electrical and Computer Engineering at the University of Waterloo, specializing in Pattern Analysis and Machine Intelligence. I received my BASc in Electrical Engineering from UWaterloo in 2025.',
  interests: ['Novel View Synthesis (NeRF, 3DGS, Audio)', 'Image Processing (IQA, VQA, Enhancement)', 'AI (Harness Engineering, Audio World Models)'],
  photo: 'assets/portrait.jpg',
};

export type Publication = {
  id: string; title: string; authors: string; venue: string; badge: string;
  year?: string; status?: string; shortLabel?: string; image?: string; links: { label: string; href: string }[];
};
export const publications: Publication[] = [
  { id: 'aesthetic', title: 'Aesthetic Camera Viewpoint Suggestion with 3D Aesthetic Field', authors: 'Sheyang Tang, Armin Shafiee Sarvestani, Jialu Xu, Xiaoyu Xu, and Zhou Wang', venue: 'IEEE/CVF Conference on Computer Vision and Pattern Recognition', badge: 'CVPR', year: '2026', image: 'assets/aesthetic.jpg', links: [{ label: 'Paper', href: 'https://arxiv.org/abs/2602.20363' }] },
  { id: 'rendu', title: 'Rendu: A Physics-Grounded Simulation Platform for Spatial Acoustic Learning', authors: 'Jialu Xu', venue: 'ECCV MUST-CV Workshop', badge: 'ECCV Workshop', year: '2026', status: 'Full version submitted to CVPR 2027', image: 'assets/rendu.jpg', links: [{ label: 'PDF', href: 'papers/rendu.pdf' }] },
  { id: 'ius', title: 'Tunable B-mode Despeckling via Image Saliency and Adaptive Stochastic Resampling', authors: 'Jialu Xu, Di Xiao, Alfred Yu, and Zhou Wang', venue: 'IEEE International Ultrasonics Symposium', badge: 'IUS', year: '2026', image: 'assets/ius.jpg', links: [{ label: 'PDF', href: 'papers/ius.pdf' }] },
];

// Names and descriptions from the owner's HornSuite asset bundle (2026-10-08).
export const simulations = [
  { id: 'HornForm', tagline: 'Horn & Waveguide Design', description: 'Design horn and waveguide geometry, explore acoustic loading and coverage, and export shapes for prototyping.', alt: 'HornForm interface showing horn geometry and acoustic response' },
  { id: 'HornPhase', tagline: 'Phase Plug & Compression Chamber', description: 'Analyze compression chambers and phase-plug channels to understand resonances and the amplitude and phase at the exit.', alt: 'HornPhase interface showing phase-plug channel response' },
  { id: 'HornDrive', tagline: 'Compression Driver Mechanics', description: 'Explore compression-driver diaphragms, suspensions, and voice-coil mechanics through modes, motion, and coupled response.', alt: 'HornDrive interface showing diaphragm mode analysis' },
  { id: 'HornResponse', tagline: 'System Matching & Coverage', description: 'Combine driver and horn models to compare system response, directivity, and equalization.', alt: 'HornResponse interface showing simulated system frequency response' },
  { id: 'HornLimit', tagline: 'Thermal & Nonlinear Limits', description: 'Evaluate thermal compression, nonlinear behavior, and operating limits under defined drive conditions.', alt: 'HornLimit interface showing coil and motor temperature during heating and cooling' },
].map(project => ({ ...project, title: project.id, image: `assets/horn/${project.id}.png`, icon: `assets/horn/${project.id}-icon.png` }));

export const coecho = {
  name: 'Coécho', organization: 'LABO Acoustics',
  description: 'An AI-native platform on macOS for audio and acoustic measurement — distortion, noise, frequency response, and latency — with real-time analysis and an auditable record behind every result.',
  support: 'Supported by AC, Waterloo and ventureLAB, Toronto.',
  image: 'assets/coecho.png',
};

export const canis = {
  organization: 'Canis AI', name: 'The Pack',
  description: 'An AI-agent marketplace for scoped work. Post a task and set a budget; an agent completes it in an isolated sandbox, with payment released only after you accept the result.',
  image: 'assets/the-pack.png', logo: 'assets/canis-ai-logo.png',
};
