import { useEffect, useState } from "react";

export const AboutUs = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check initial theme
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
    };

    checkTheme();

    // Create observer to watch for theme changes
    const observer = new MutationObserver(() => {
      checkTheme();
    });

    // Watch for class changes on document.documentElement (html element)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section id="about" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
          }`}>
          About <span className={
            isDarkMode
              ? 'text-primary'
              : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
          }>Me</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 backdrop-blur-sm card-hover">
            <div>
              <h3 className={`text-2xl font-semibold ${isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
                }`}>
                AI/ML Engineer · Medical AI · Computer Vision · Edge AI
              </h3>
              <p className={`mt-2 font-medium ${isDarkMode ? 'text-primary' : 'text-red-600'
                }`}>
                Data Science Intern @ Novartis · BITS Pilani ECE
              </p>
            </div>
            <p className={`${isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
              }`}>
              I'm Tarun Warrier, an AI/ML engineer in my final year of B.E. (Hons.) in Electronics and Communication Engineering at BITS Pilani, Goa. I build AI systems across domains, from healthcare and drug discovery to transportation and energy.
            </p>
            <p className={`${isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
              }`}>
              My project experience spans a wide range, including multimodal deep learning for heart disease detection (Molbio Student Innovation Award), molecular toxicity prediction that outperforms established benchmarks with a fraction of the features, aneurysm detection from 3D brain scans, anomaly detection for power grid monitoring, agentic systems and reinforcement learning game AI.
            </p>
            <p className={`${isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10'
              }`}>
              My skills cover deep learning, computer vision, NLP, graph neural networks, reinforcement learning and edge AI deployment. I'm drawn to problems where AI has to work reliably under constraints, whether that's messy clinical data, live databases, or resource-limited hardware.
            </p>
          </div>

          <div className="space-y-6">
            <div className={`p-6 rounded-lg border backdrop-blur-sm card-hover ${isDarkMode
              ? 'border-border bg-card/50'
              : 'border-gray-200 bg-white/10'
              }`}>
              <h4 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-foreground' : 'text-black'
                }`}>
                Core Expertise
              </h4>
              <div className="space-y-2">
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Frameworks:</strong> PyTorch, TensorFlow, Scikit-learn, LangChain, NumPy, Pandas
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Computer Vision:</strong> CNN, Transformers, Segmentation, Weak Supervision
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Volumetric & Multimodal:</strong> 3D CNNs, Multimodal Fusion
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Deep Learning & ML:</strong> LSTM, RGCN, Stacking Ensembles, Double Q-Learning
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>AI Applications:</strong> RAG, NLP, Reinforcement Learning, Multi-Agent Systems
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Edge & Hardware:</strong> ADI MAX78000FTHR microcontroller, EdgeAI deployment
                </div>
                <div className={`text-sm ${isDarkMode ? 'text-muted-foreground' : 'text-gray-700'
                  }`}>
                  <strong>Languages:</strong> Python, Java, C/C++, MATLAB
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/tarundevs"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-6 py-2 rounded-full border transition-colors duration-300 card-hover ${isDarkMode
              ? 'border-primary text-primary hover:bg-primary/10'
              : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
              }`}
          >
            View GitHub Projects
          </a>

          <a
            href="https://www.linkedin.com/in/tarun-warrier/"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-6 py-2 rounded-full border transition-colors duration-300 card-hover ${isDarkMode
              ? 'border-primary text-primary hover:bg-primary/10'
              : 'border-red-600 text-red-600 hover:bg-red-600/10 bg-white/10 backdrop-blur-sm'
              }`}
          >
            LinkedIn Profile
          </a>
        </div>
      </div>
    </section>
  );
};