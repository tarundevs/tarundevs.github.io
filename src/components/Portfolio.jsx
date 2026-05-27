import { useState, useEffect } from 'react';
import { Github, ExternalLink, Award, Brain, Heart, Zap, Code, Database, Cpu, Briefcase, GraduationCap, Building2 } from 'lucide-react';

export const Portfolio = () => {
  const [selectedType, setSelectedType] = useState('all');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Theme detection effect
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(true);
    };
    
    checkTheme();
    
    const observer = new MutationObserver(() => {
      checkTheme();
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const projects = [
    // Experience
    {
      id: 1,
      title: "Data Science Intern",
      type: "experience",
      description: "Built an AI assistant for medical reviewers handling drug safety case reports, reducing processing time from 20-30 minutes to under 1 minute. Designed a pipeline that calls multiple AI models with live database searches across Embase and openFDA.",
      technologies: ["Python", "RAG", "LLMs", "Embase", "openFDA"],
      status: "Present",
      company: "Novartis Healthcare",
      icon: <Briefcase className="w-6 h-6" />,
      metrics: {
        impact: "20x Speedup",
        accuracy: "High",
        role: "Internship"
      },
      details: "Reduced incorrect AI outputs by grounding responses in retrieved source documents; improved retrieval quality and managed input size for accurate analysis of complex safety datasets.",
      projectType: "Experience"
    },
    {
      id: 2,
      title: "Research Intern",
      type: "experience",
      description: "Applied a deep learning model for local image feature matching on Google Street View imagery for transportation research.",
      technologies: ["Python", "Deep Learning", "Computer Vision", "Data Annotation"],
      status: "Completed",
      company: "CiSTUP, IISc Bangalore",
      icon: <Brain className="w-6 h-6" />,
      metrics: {
        dataset: "10,000+ Images",
        application: "Traffic Re-ID",
        role: "Internship"
      },
      details: "Built India's largest annotated vehicle dataset for Indian traffic conditions, with over 10,000 labelled images for vehicle re-identification.",
      projectType: "Experience"
    },
    {
      id: 3,
      title: "AI/ML Intern",
      type: "experience",
      description: "Built an anomaly detection system for power grid monitoring aimed at identifying the type of fault or anomaly present, achieving 94% classification accuracy.",
      technologies: ["Python", "CNN-LSTM", "Time-series Clustering"],
      status: "Completed",
      company: "Southern Regional Load Dispatch Centre",
      icon: <Zap className="w-6 h-6" />,
      metrics: {
        accuracy: "94%",
        model: "Hybrid CNN-LSTM",
        role: "Internship"
      },
      details: "Improved detection coverage by combining supervised and unsupervised methods, including time-series clustering for voltage pattern recognition.",
      projectType: "Experience"
    },
    
    // Flagship Projects
    {
      id: 4,
      title: "NeuroValve",
      type: "flagship",
      description: "NeuroValve is a multimodal AI diagnostic system for valvular heart disease detection, using both PCG (Phonocardiogram) and ECG data, supported by Molbio Diagnostics. It was built on top of an earlier prototype developed during the Anveshan Fellowship, a competitive research fellowship by Analog Devices Inc. (ADI), where selected participants are provided with ADI hardware to build and deploy real-world solutions.",
      technologies: ["Python", "EdgeAI", "Deep Learning", "Multimodal", "ADI MAX78000FTHR"],
      status: "Ongoing",
      achievement: "Molbio Student Innovation Award",
      icon: <Heart className="w-6 h-6" />,
      metrics: {
        accuracy: "AUC 0.80 (OOD)",
        prototype: "95% (PCG)",
        platform: "Edge/Microcontroller"
      },
      details: "The prototype was deployed on the ADI MAX78000FTHR microcontroller (provided through the fellowship), using PCG data alone and achieving 95% accuracy. NeuroValve expanded on this by incorporating ECG data alongside PCG, achieving an AUC of 80% on out-of-domain external testing, showing real-world generalizability beyond the training distribution.",
      projectType: "Flagship Project"
    },
    {
      id: 5,
      title: "StackTox: Molecular Toxicity Prediction",
      type: "flagship",
      description: "Stacking model for molecular toxicity prediction, aimed at reducing the time and cost of lab-based screening in drug discovery and chemical safety.",
      technologies: ["Python", "LightGBM", "Random Forest", "SVM", "Logistic Regression"],
      status: "Completed",
      icon: <Database className="w-6 h-6" />,
      metrics: {
        accuracy: "AUC 0.721 (OOD)",
        features: "61 vs 944+",
        dataset: "16,192 molecules"
      },
      details: "Achieved AUC 0.721 on an out of distribution assessment, outperforming MolToxPred, eToxPred, and ToxinPredictor using only 61 features compared to 944–2,237 in competing models.",
      projectType: "Flagship Project"
    },
    {
      id: 6,
      title: "Aneurysm Detection (3D Volumetric Imaging)",
      type: "flagship",
      description: "Intracranial aneurysm detection system using high and low-resolution MR and CT scans of the Circle of Willis.",
      technologies: ["Python", "3D CNN", "Medical Imaging", "MR/CT"],
      status: "Completed",
      icon: <Brain className="w-6 h-6" />,
      metrics: {
        accuracy: "AUC 0.80",
        approach: "Two-stage",
        type: "3D Volumetric"
      },
      details: "Used a two-stage approach: region-of-interest selection followed by a 3D CNN for classification.",
      projectType: "Flagship Project"
    },
    {
      id: 7,
      title: "AI Knowledge Graph Intelligence",
      type: "flagship",
      description: "Knowledge graph system using a graph neural network with text and image embeddings for multi-category classification.",
      technologies: ["Python", "RGCN", "BERT", "CLIP", "Graph Neural Networks"],
      status: "Completed",
      github: "https://github.com/tarundevs/Mutlimodal-RGCN",
      icon: <Database className="w-6 h-6" />,
      metrics: {
        accuracy: "79%",
        type: "Multimodal",
        embeddings: "BERT + CLIP"
      },
      details: "Built system with optimized caching for computational efficiency and multimodal data processing.",
      projectType: "Flagship Project"
    },
    {
      id: 8,
      title: "Reinforcement Learning Game AI",
      type: "flagship",
      description: "Self-learning game agent using Double Q-Learning that achieved an 88% win rate through trial-and-error training.",
      technologies: ["Python", "Reinforcement Learning", "Double Q-Learning", "Game AI"],
      status: "Completed",
      github: "https://github.com/tarundevs/DRL-TicTacToe",
      icon: <Cpu className="w-6 h-6" />,
      metrics: {
        winRate: "88%",
        learning: "Autonomous",
        algorithm: "Double Q-Learning"
      },
      details: "AI agent achieved high performance through autonomous learning and policy optimization techniques.",
      projectType: "Flagship Project"
    }
  ];

  const projectTypes = [
    { 
      id: 'all', 
      name: 'All', 
      count: projects.length, 
      icon: <Code className="w-4 h-4" />,
      description: 'All roles and projects'
    },
    { 
      id: 'experience', 
      name: 'Experience', 
      count: projects.filter(p => p.type === 'experience').length,
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Professional experience and internships'
    },
    { 
      id: 'flagship', 
      name: 'Flagship Projects', 
      count: projects.filter(p => p.type === 'flagship').length,
      icon: <Award className="w-4 h-4" />,
      description: 'Major projects and research'
    }
  ];

  const filteredProjects = projects.filter(project => {
    return selectedType === 'all' || project.type === selectedType;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ongoing': 
      case 'Present': return isDarkMode ? 'text-blue-400' : 'text-blue-600';
      case 'Completed': return isDarkMode ? 'text-green-400' : 'text-green-600';
      default: return isDarkMode ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'Ongoing': 
      case 'Present': return isDarkMode ? 'bg-blue-400/10' : 'bg-blue-100';
      case 'Completed': return isDarkMode ? 'bg-green-400/10' : 'bg-green-100';
      default: return isDarkMode ? 'bg-gray-400/10' : 'bg-gray-100';
    }
  };

  const getProjectTypeBadge = (type) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium";
    switch (type) {
      case 'experience':
        return `${baseClasses} ${isDarkMode ? 'bg-purple-400/10 text-purple-400' : 'bg-purple-100 text-purple-700'}`;
      case 'flagship':
        return `${baseClasses} ${isDarkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700'}`;
      default:
        return `${baseClasses} ${isDarkMode ? 'bg-gray-400/10 text-gray-400' : 'bg-gray-100 text-gray-700'}`;
    }
  };

  const getTypeButtonColor = (type) => {
    switch (type) {
      case 'experience':
        return selectedType === type
          ? (isDarkMode ? 'border-purple-400 bg-purple-400/10 text-purple-400' : 'border-purple-600 bg-purple-600/10 text-purple-600')
          : (isDarkMode ? 'border-border text-muted-foreground hover:border-purple-400/50 hover:text-foreground' : 'border-gray-300 text-gray-600 hover:border-purple-600/50 hover:text-black bg-white/10 backdrop-blur-sm');
      case 'flagship':
        return selectedType === type
          ? (isDarkMode ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-yellow-600 bg-yellow-600/10 text-yellow-600')
          : (isDarkMode ? 'border-border text-muted-foreground hover:border-yellow-400/50 hover:text-foreground' : 'border-gray-300 text-gray-600 hover:border-yellow-600/50 hover:text-black bg-white/10 backdrop-blur-sm');
      default:
        return selectedType === type
          ? (isDarkMode ? 'border-primary bg-primary/10 text-primary' : 'border-red-600 bg-red-600/10 text-red-600')
          : (isDarkMode ? 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground' : 'border-gray-300 text-gray-600 hover:border-red-600/50 hover:text-black bg-white/10 backdrop-blur-sm');
    }
  };

  return (
    <section id="portfolio" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-7xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
          isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
        }`}>
          My <span className={
            isDarkMode 
              ? 'text-primary' 
              : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
          }>Experience & Projects</span>
        </h2>

        {/* Project Type Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {projectTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full border transition-all duration-300 card-hover ${
                getTypeButtonColor(type.id)
              }`}
              title={type.description}
            >
              {type.icon}
              {type.name} ({type.count})
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <div
              key={project.id}
              className={`${
                isDarkMode ? 'gradient-border p-6 card-hover' : 'bg-white/10 backdrop-blur-sm p-6 card-hover border border-gray-200'
              } group cursor-pointer transition-all duration-300 hover:scale-105`}
              onClick={() => setSelectedProject(project)}
            >
              {/* Project Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${
                  project.type === 'experience' ? (isDarkMode ? 'bg-purple-400/10 text-purple-400' : 'bg-purple-100 text-purple-600') :
                  project.type === 'flagship' ? (isDarkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-100 text-yellow-600') :
                  (isDarkMode ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-600')
                }`}>
                  {project.icon}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusBg(project.status)} ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                  {project.achievement && (
                    <Award className={`w-4 h-4 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} title={project.achievement} />
                  )}
                </div>
              </div>

              {/* Project Type Badge */}
              <div className="mb-3">
                <span className={getProjectTypeBadge(project.type)}>
                  {project.projectType}
                </span>
              </div>

              {/* Project Title */}
              <h3 className={`text-xl font-semibold mb-1 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                {project.title}
              </h3>
              
              {project.company && (
                <div className={`text-sm font-medium mb-3 flex items-center gap-1 ${
                  isDarkMode ? 'text-primary' : 'text-red-600'
                }`}>
                  <Building2 className="w-3 h-3" />
                  {project.company}
                </div>
              )}

              {/* Project Description */}
              <p className={`text-sm mb-4 line-clamp-3 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                {project.description}
              </p>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {Object.entries(project.metrics).map(([key, value]) => (
                  <div key={key} className={`text-xs ${
                    isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                  }`}>
                    <span className="capitalize font-medium">{key.replace('_', ' ')}:</span> {value}
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-1 mb-4">
                {project.technologies.slice(0, 3).map(tech => (
                  <span
                    key={tech}
                    className={`px-2 py-1 text-xs rounded ${
                      isDarkMode 
                        ? 'bg-secondary/50 text-secondary-foreground' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 3 && (
                  <span className={`px-2 py-1 text-xs rounded ${
                    isDarkMode ? 'bg-secondary/50 text-secondary-foreground' : 'bg-gray-100 text-gray-700'
                  }`}>
                    +{project.technologies.length - 3}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {project.github && (
                  <a
                    href={project.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className={`flex items-center gap-1 px-3 py-1 text-xs rounded border transition-colors ${
                      isDarkMode 
                        ? 'border-border text-muted-foreground hover:text-foreground hover:border-primary' 
                        : 'border-gray-300 text-gray-600 hover:text-black hover:border-red-600'
                    }`}
                  >
                    <Github className="w-3 h-3" />
                    Code
                  </a>
                )}
                <button
                  className={`flex items-center gap-1 px-3 py-1 text-xs rounded border transition-colors ${
                    project.type === 'experience' ? 
                      (isDarkMode ? 'border-purple-400 text-purple-400 hover:bg-purple-400/10' : 'border-purple-600 text-purple-600 hover:bg-purple-600/10') :
                    project.type === 'flagship' ? 
                      (isDarkMode ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' : 'border-yellow-600 text-yellow-600 hover:bg-yellow-600/10') :
                      (isDarkMode ? 'border-primary text-primary hover:bg-primary/10' : 'border-red-600 text-red-600 hover:bg-red-600/10')
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Project Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedProject(null)}>
            <div 
              className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg p-6 ${
                isDarkMode ? 'bg-background border border-border' : 'bg-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="mb-2">
                    <span className={getProjectTypeBadge(selectedProject.type)}>
                      {selectedProject.projectType}
                    </span>
                  </div>
                  <h3 className={`text-2xl font-bold mb-1 ${
                    isDarkMode ? 'text-foreground' : 'text-black'
                  }`}>
                    {selectedProject.title}
                  </h3>
                  {selectedProject.company && (
                    <div className={`font-medium mb-2 flex items-center gap-1 ${
                      isDarkMode ? 'text-primary' : 'text-red-600'
                    }`}>
                      <Building2 className="w-4 h-4" />
                      {selectedProject.company}
                    </div>
                  )}
                  {selectedProject.achievement && (
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
                    }`}>
                      🏆 {selectedProject.achievement}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`text-2xl ${
                    isDarkMode ? 'text-muted-foreground hover:text-foreground' : 'text-gray-500 hover:text-black'
                  }`}
                >
                  ×
                </button>
              </div>

              <p className={`mb-6 ${
                isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
              }`}>
                {selectedProject.description}
              </p>

              <p className={`mb-6 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                {selectedProject.details}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(selectedProject.metrics).map(([key, value]) => (
                  <div key={key} className={`p-3 rounded-lg ${
                    isDarkMode ? 'bg-secondary/50' : 'bg-gray-100'
                  }`}>
                    <div className={`text-xs ${
                      isDarkMode ? 'text-muted-foreground' : 'text-gray-600'
                    }`}>
                      {key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1)}
                    </div>
                    <div className={`font-semibold ${
                      isDarkMode ? 'text-foreground' : 'text-black'
                    }`}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6">
                <h4 className={`font-semibold mb-3 ${
                  isDarkMode ? 'text-foreground' : 'text-black'
                }`}>
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map(tech => (
                    <span
                      key={tech}
                      className={`px-3 py-1 text-sm rounded ${
                        selectedProject.type === 'experience' ? 
                          (isDarkMode ? 'bg-purple-400/10 text-purple-400' : 'bg-purple-100 text-purple-700') :
                        selectedProject.type === 'flagship' ? 
                          (isDarkMode ? 'bg-yellow-400/10 text-yellow-400' : 'bg-yellow-100 text-yellow-700') :
                          (isDarkMode ? 'bg-primary/10 text-primary' : 'bg-red-100 text-red-700')
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {selectedProject.github && (
                <div className="flex gap-4">
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg border transition-colors ${
                      selectedProject.type === 'experience' ? 
                        (isDarkMode ? 'border-purple-400 text-purple-400 hover:bg-purple-400/10' : 'border-purple-600 text-purple-600 hover:bg-purple-600/10') :
                      selectedProject.type === 'flagship' ? 
                        (isDarkMode ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400/10' : 'border-yellow-600 text-yellow-600 hover:bg-yellow-600/10') :
                        (isDarkMode ? 'border-primary text-primary hover:bg-primary/10' : 'border-red-600 text-red-600 hover:bg-red-600/10')
                    }`}
                  >
                    <Github className="w-4 h-4" />
                    View Code
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};