import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Copy, Download } from 'lucide-react';
import { Footer } from "./Footer";

export const Speech_ASL = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aslImages, setAslImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const recognitionRef = useRef(null);
  const animationRef = useRef(null);

  // Theme detection
  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const hasDarkClass = htmlElement.classList.contains('dark');
      setIsDarkMode(hasDarkClass);
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

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript + interimTranscript);
        
        if (finalTranscript) {
          convertToASL(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript('');
      setAslImages([]);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const convertToASL = async (text) => {
    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Process text as individual characters, keeping letters and spaces
      const characters = text.toLowerCase().split('').filter(char => /[a-z]/.test(char) || char === ' ');
      // Map each character to its corresponding image file
      const imagePaths = characters.length > 0 
        ? characters.map(char => char === ' ' ? '/signs/space.jpg' : `/signs/${char}.jpg`)
        : ['/signs/nothing.jpg'];
      setAslImages(imagePaths);
    } catch (error) {
      console.error('ASL conversion error:', error);
      setAslImages(['/signs/nothing.jpg']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setTranscript('');
    setAslImages([]);
    setConfidence(0);
    if (isListening) {
      stopListening();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
  };

  const handleDownload = () => {
    if (aslImages.length > 0 && aslImages[0] !== '/signs/nothing.jpg') {
      console.log('Downloading ASL images:', aslImages);
      alert('ASL images download started!');
    }
  };

  return (
    <section>
    <div id="speech_asl" className="container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${
            isDarkMode ? 'text-foreground' : 'text-black'
          }`}>
            <span className={
              isDarkMode 
                ? 'bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent'
                : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
            }>
              Speech to ASL
            </span>
          </h1>
          <p className={`text-lg max-w-2xl mx-auto ${
            isDarkMode ? 'text-muted-foreground' : 'text-black bg-white/10 p-4 rounded-lg'
          }`}>
            Convert your spoken words into American Sign Language letter images in real-time.
            Speak clearly and watch your words come to life in ASL.
          </p>
        </div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Speech Input Section */}
          <div className={`${
            isDarkMode 
              ? 'bg-card border rounded-xl p-6 shadow-lg' 
              : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg'
          } card-hover`}>
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-foreground' : 'text-black'
            }`}>
              <Mic className="w-6 h-6" />
              Speech Input
            </h2>
            
            {/* Microphone Controls */}
            <div className="flex items-center justify-center mb-6">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : isDarkMode
                      ? 'bg-primary hover:bg-primary/80'
                      : 'bg-red-600 hover:bg-red-700'
                } text-white shadow-lg`}
              >
                {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {/* Status Indicator */}
            <div className="text-center mb-4">
              <p className={`text-sm font-medium ${
                isListening 
                  ? 'text-red-500' 
                  : isDarkMode 
                    ? 'text-muted-foreground' 
                    : 'text-black'
              }`}>
                {isListening ? 'Listening...' : 'Click to start speaking'}
              </p>
              {confidence > 0 && (
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-muted-foreground' : 'text-black/70'
                }`}>
                  Confidence: {Math.round(confidence * 100)}%
                </p>
              )}
            </div>

            {/* Transcript Display */}
            <div className={`${
              isDarkMode 
                ? 'bg-muted rounded-lg p-4' 
                : 'bg-white/20 backdrop-blur-sm rounded-lg p-4 border border-white/30'
            } min-h-[120px]`}>
              <p className={`text-sm mb-2 ${
                isDarkMode ? 'text-muted-foreground' : 'text-black/70'
              }`}>
                Transcript:
              </p>
              <p className={isDarkMode ? 'text-foreground' : 'text-black'}>
                {transcript || 'Your spoken words will appear here...'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleReset}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-secondary hover:bg-secondary/80' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-black'
                }`}
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleCopy}
                disabled={!transcript}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-primary hover:bg-primary/80 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
            </div>
          </div>

          {/* ASL Output Section */}
          <div className={`${
            isDarkMode 
              ? 'bg-card border rounded-xl p-6 shadow-lg' 
              : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg'
          } card-hover`}>
            <h2 className={`text-2xl font-semibold mb-4 flex items-center gap-2 ${
              isDarkMode ? 'text-foreground' : 'text-black'
            }`}>
              <Volume2 className="w-6 h-6" />
              ASL Letter Images
            </h2>

            {/* ASL Images Display */}
            <div className={`${
              isDarkMode 
                ? 'bg-muted rounded-lg p-8' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-8'
            } min-h-[200px] flex flex-wrap items-center justify-center gap-4 mb-4`}>
              {isProcessing ? (
                <div className="text-center">
                  <div className={`animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4 ${
                    isDarkMode ? 'border-primary' : 'border-red-600'
                  }`}></div>
                  <p className={isDarkMode ? 'text-muted-foreground' : 'text-black/70'}>
                    Converting to ASL images...
                  </p>
                </div>
              ) : aslImages.length > 0 ? (
                <div className="text-center">
                  <div className="flex flex-wrap justify-center gap-4">
                    {aslImages.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`ASL ${image.includes('space.jpg') ? 'space' : image.includes('nothing.jpg') ? 'nothing' : 'letter ' + image.split('/').pop().replace('.jpg', '')}`}
                        className="w-16 h-16 object-contain"
                        onError={() => console.error(`Failed to load image: ${image}`)}
                      />
                    ))}
                  </div>
                  <p className={`text-sm mt-4 ${
                    isDarkMode ? 'text-muted-foreground' : 'text-black/70'
                  }`}>
                    {aslImages[0] === '/signs/nothing.jpg' ? 'No valid letters or spaces detected' : 'ASL Letter Images Ready'}
                  </p>
                </div>
              ) : (
                <div className={`text-center ${
                  isDarkMode ? 'text-muted-foreground' : 'text-black/70'
                }`}>
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 mx-auto ${
                    isDarkMode ? 'bg-muted-foreground/10' : 'bg-black/10'
                  }`}>
                    <Volume2 className="w-12 h-12 opacity-30" />
                  </div>
                  <p>ASL letter images will appear here</p>
                </div>
              )}
            </div>

            {/* Animation Controls */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'bg-secondary hover:bg-secondary/80' 
                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-black'
                }`}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isMuted ? 'Unmute' : 'Mute'}
              </button>
              <button
                onClick={handleDownload}
                disabled={aslImages.length === 0 || aslImages[0] === '/signs/nothing.jpg'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isDarkMode 
                    ? 'bg-primary hover:bg-primary/80 text-white' 
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Features Info */}
        <div className={`${
          isDarkMode 
            ? 'bg-card border rounded-xl p-6 shadow-lg' 
            : 'bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg'
        } card-hover`}>
          <h3 className={`text-xl font-semibold mb-4 ${
            isDarkMode ? 'text-foreground' : 'text-black'
          }`}>
            Features
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className={`${
              isDarkMode 
                ? 'bg-muted rounded-lg p-4' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4'
            }`}>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                Real-time Recognition
              </h4>
              <p className={isDarkMode ? 'text-muted-foreground' : 'text-black/70'}>
                Advanced speech recognition with high accuracy and confidence scoring.
              </p>
            </div>
            <div className={`${
              isDarkMode 
                ? 'bg-muted rounded-lg p-4' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4'
            }`}>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                ASL Letter Images
              </h4>
              <p className={isDarkMode ? 'text-muted-foreground' : 'text-black/70'}>
                Displays images for individual ASL letters and spaces based on your spoken words.
              </p>
            </div>
            <div className={`${
              isDarkMode 
                ? 'bg-muted rounded-lg p-4' 
                : 'bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-4'
            }`}>
              <h4 className={`font-medium mb-2 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                Export Options
              </h4>
              <p className={isDarkMode ? 'text-muted-foreground' : 'text-black/70'}>
                Download ASL images or copy transcripts for later use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </section>
  );
};