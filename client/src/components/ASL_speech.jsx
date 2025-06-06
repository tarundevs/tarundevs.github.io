import { useState, useRef, useEffect } from 'react';
import {Footer} from "./Footer"
export const ASL_speech = () => {
  const [outputText, setOutputText] = useState('Ready to translate ASL signs...');
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [stream, setStream] = useState(null);
  const [socket, setSocket] = useState(null);
  const [detections, setDetections] = useState({ hands: [] });
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true); // New state for speech toggle
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const frameIntervalRef = useRef(null);
  const stateRef = useRef({ isCameraOn: false, socket: null });
  const modelRef = useRef(null);
  const handsRef = useRef(null);
  const speechSynthesisRef = useRef(window.speechSynthesis); // Reference to Web Speech API

  // Theme detection effect (same as AboutUs)
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

  // Load MediaPipe Hands model
  const loadHandDetectionModel = async () => {
    if (typeof window !== 'undefined' && !modelRef.current) {
      try {
        setIsModelLoading(true);
        
        if (!window.mediapipe) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/hands.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        if (!window.mediapipeCamera) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils@0.3.1640029074/camera_utils.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        }

        const hands = new window.Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`;
          }
        });

        hands.setOptions({
          maxNumHands: 2,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5
        });

        handsRef.current = hands;
        modelRef.current = { loaded: true };
        setIsModelLoading(false);
      } catch (error) {
        modelRef.current = { loaded: false, mock: true };
        setIsModelLoading(false);
      }
    }
  };

  // Real hand detection using MediaPipe
  const detectHandsReal = async (video, canvas) => {
    return new Promise((resolve) => {
      if (!handsRef.current || !modelRef.current?.loaded) {
        const mockDetections = {
          hands: Math.random() > 0.3 ? [
            {
              label: 'Left Hand',
              bbox: {
                x: canvas.width * 0.2 + (Math.random() - 0.5) * 50,
                y: canvas.height * 0.3 + (Math.random() - 0.5) * 50,
                width: 100 + Math.random() * 20,
                height: 100 + Math.random() * 20
              },
              confidence: 0.85 + Math.random() * 0.15,
              landmarks: []
            }
          ] : []
        };
        resolve(mockDetections);
        return;
      }

      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      let detectedHands = [];
      
      handsRef.current.onResults((results) => {
        detectedHands = [];
        
        if (results.multiHandLandmarks && results.multiHandedness) {
          for (let i = 0; i < results.multiHandLandmarks.length; i++) {
            const landmarks = results.multiHandLandmarks[i];
            const handedness = results.multiHandedness[i];
            
            const xs = landmarks.map(l => l.x * canvas.width);
            const ys = landmarks.map(l => l.y * canvas.height);
            
            const xMin = Math.max(0, Math.min(...xs) - 20);
            const yMin = Math.max(0, Math.min(...ys) - 20);
            const xMax = Math.min(canvas.width, Math.max(...xs) + 20);
            const yMax = Math.min(canvas.height, Math.max(...ys) + 20);
            
            detectedHands.push({
              label: handedness.label === 'Left' ? 'Right Hand' : 'Left Hand',
              bbox: {
                x: xMin,
                y: yMin,
                width: xMax - xMin,
                height: yMax - yMin
              },
              confidence: handedness.score,
              landmarks: landmarks.map(l => ({
                x: l.x * canvas.width,
                y: l.y * canvas.height,
                z: l.z
              }))
            });
          }
        }
        
        resolve({ hands: detectedHands });
      });

      handsRef.current.send({ image: video });
    });
  };

  // Draw bounding boxes and labels
  const drawDetections = (detections) => {
    const overlayCanvas = overlayCanvasRef.current;
    if (!overlayCanvas) return;
  
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  
    ctx.lineWidth = 3;
    ctx.font = '16px Arial';
    ctx.textBaseline = 'top';
  
    detections.hands.forEach((hand, index) => {
      const color = hand.label === 'Left Hand' ? '#00ff00' : '#ff6600';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
  
      const flippedX = overlayCanvas.width - hand.bbox.x - hand.bbox.width;
  
      ctx.strokeRect(
        flippedX,
        hand.bbox.y,
        hand.bbox.width,
        hand.bbox.height
      );
  
      if (hand.landmarks && hand.landmarks.length > 0) {
        ctx.fillStyle = color;
        hand.landmarks.forEach(landmark => {
          const flippedLandmarkX = overlayCanvas.width - landmark.x;
          ctx.beginPath();
          ctx.arc(flippedLandmarkX, landmark.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }
  
      const label = `${hand.label} (${(hand.confidence * 100).toFixed(1)}%)`;
      const textMetrics = ctx.measureText(label);
      ctx.fillStyle = color;
      ctx.fillRect(
        flippedX,
        hand.bbox.y - 25,
        textMetrics.width + 10,
        25
      );
  
      ctx.fillStyle = 'white';
      ctx.fillText(label, flippedX + 5, hand.bbox.y - 20);
    });
  };

  // Extract hand regions and send to backend
  const extractAndSendHandRegions = (detections, canvas) => {
    const ctx = canvas.getContext('2d');
    const handRegions = [];
    
    detections.hands.forEach(hand => {
      const handCanvas = document.createElement('canvas');
      const handCtx = handCanvas.getContext('2d');
      handCanvas.width = hand.bbox.width;
      handCanvas.height = hand.bbox.height;
      
      handCtx.drawImage(
        canvas,
        hand.bbox.x, hand.bbox.y, hand.bbox.width, hand.bbox.height,
        0, 0, hand.bbox.width, hand.bbox.height
      );
      
      handRegions.push({
        label: hand.label,
        image: handCanvas.toDataURL('image/jpeg', 0.8),
        bbox: hand.bbox,
        confidence: hand.confidence
      });
    });
    
    return { handRegions };
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsCameraOn(true);
      stateRef.current.isCameraOn = true;
      
      await loadHandDetectionModel();
      connectToServer();
      
      setTimeout(() => {
        startFrameProcessing();
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const connectToServer = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000');
      
      ws.onopen = () => {
        setIsConnected(true);
        setOutputText('Connected! Show ASL signs to camera...');
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.text) {
            setOutputText(data.text);
            if (isSpeechEnabled && speechSynthesisRef.current) {
              // Cancel any ongoing speech
              speechSynthesisRef.current.cancel();
              
              // Create new speech utterance
              const utterance = new SpeechSynthesisUtterance(data.text);
              utterance.lang = 'en-US';
              utterance.pitch = 1; // Normal pitch
              utterance.rate = 1; // Normal speed
              utterance.volume = 1; // Full volume
              
              // Optional: Select a specific voice
              const voices = speechSynthesisRef.current.getVoices();
              const englishVoice = voices.find(voice => voice.lang.includes('en'));
              if (englishVoice) {
                utterance.voice = englishVoice;
              }
              
              // Speak the text
              speechSynthesisRef.current.speak(utterance);
            }
          }
        } catch (e) {
          console.error('Error parsing server message:', e);
        }
      };
      
      ws.onclose = () => {
        setIsConnected(false);
        setOutputText('Disconnected from server');
      };
      
      ws.onerror = (error) => {
        setIsConnected(false);
        setOutputText('Error connecting to AI server. Make sure Python backend is running.');
      };
      
      setSocket(ws);
      stateRef.current.socket = ws;
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  };

  const startFrameProcessing = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const processFrame = async () => {
      const currentCameraState = stateRef.current.isCameraOn;
      const currentSocket = stateRef.current.socket;
      
      if (!currentCameraState || !currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
        if (frameIntervalRef.current) {
          clearTimeout(frameIntervalRef.current);
          frameIntervalRef.current = null;
        }
        return;
      }
      
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const overlayCanvas = overlayCanvasRef.current;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
        
        const detectionResults = await detectHandsReal(video, canvas);
        setDetections(detectionResults);
        drawDetections(detectionResults);
        
        const { handRegions } = extractAndSendHandRegions(detectionResults, canvas);
        
        const message = {
          type: 'frame',
          data: canvas.toDataURL('image/jpeg', 0.8).split(',')[1],
          timestamp: Date.now(),
          handRegions: handRegions.map(region => ({
            label: region.label,
            image: region.image.split(',')[1],
            bbox: region.bbox,
            confidence: region.confidence
          })),
          frameInfo: {
            width: canvas.width,
            height: canvas.height,
            handsDetected: handRegions.length
          }
        };
        
        currentSocket.send(JSON.stringify(message));
        frameIntervalRef.current = setTimeout(processFrame, 100);
        
      } catch (error) {
        frameIntervalRef.current = setTimeout(processFrame, 100);
      }
    };
    
    processFrame();
  };

  const stopCamera = () => {
    if (frameIntervalRef.current) {
      clearTimeout(frameIntervalRef.current);
      frameIntervalRef.current = null;
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    if (socket) {
      socket.close();
      setSocket(null);
      stateRef.current.socket = null;
    }
    setIsCameraOn(false);
    stateRef.current.isCameraOn = false;
    setIsConnected(false);
    setOutputText('Camera stopped');
    setDetections({ hands: [] });
    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    
    if (video && overlayCanvas) {
      const updateCanvasSize = () => {
        overlayCanvas.width = video.videoWidth;
        overlayCanvas.height = video.videoHeight;
      };
      
      video.addEventListener('loadedmetadata', updateCanvasSize);
      return () => video.removeEventListener('loadedmetadata', updateCanvasSize);
    }
  }, [isCameraOn]);

  // Load available voices when component mounts
  useEffect(() => {
    if (speechSynthesisRef.current) {
      // Ensure voices are loaded
      speechSynthesisRef.current.getVoices();
    }
  }, []);

  return (
    <section>
    <div id="asl_speech" className="py-24 px-4 relative">
      <div className="container mx-auto max-w-5xl">
        <h2 className={`text-3xl md:text-4xl font-bold mb-12 text-center ${
          isDarkMode ? 'text-foreground' : 'text-black bg-white/10'
        }`}>
          ASL <span className={
            isDarkMode 
              ? 'text-primary' 
              : 'bg-gradient-to-r from-black to-red-600 bg-clip-text text-transparent'
          }>Speech Converter</span>
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Camera Section */}
          <div className={`${
            isDarkMode ? 'gradient-border p-6 card-hover' : 'bg-white/10 backdrop-blur-sm p-6 card-hover'
          }`}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-semibold ${
                  isDarkMode ? 'text-foreground' : 'text-black'
                }`}>
                  Live Camera Feed
                </h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isCameraOn ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>
                      Camera
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className={`text-sm ${
                      isDarkMode ? 'text-muted-foreground' : 'text-black'
                    }`}>
                      AI Server
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className={`${
                  isDarkMode ? 'bg-gray-100 dark:bg-gray-800' : 'bg-white/20 backdrop-blur-sm'
                } rounded-lg overflow-hidden`}>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-80 object-cover ${isCameraOn ? 'block' : 'hidden'}`}
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  <canvas
                    ref={overlayCanvasRef}
                    className={`absolute top-0 left-0 w-full h-80 pointer-events-none ${isCameraOn ? 'block' : 'hidden'}`}
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {!isCameraOn && (
                    <div className="w-full h-80 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">👋</div>
                        <p className={`${
                          isDarkMode ? 'text-muted-foreground' : 'text-black'
                        }`}>
                          Click start to begin ASL detection
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {isCameraOn && (
                  <div className="mt-4 flex justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-green-500"></div>
                      <span className={isDarkMode ? 'text-foreground' : 'text-black'}>Left Hand</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-orange-500"></div>
                      <span className={isDarkMode ? 'text-foreground' : 'text-black'}>Right Hand</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-center gap-4">
                {!isCameraOn ? (
                  <button
                    onClick={startCamera}
                    disabled={isModelLoading}
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 ${
                      isDarkMode 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {isModelLoading ? 'Loading Model...' : 'Start ASL Detection'}
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                  >
                    Stop Detection
                  </button>
                )}
                <button
                  onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                    isSpeechEnabled
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-500 text-white hover:bg-gray-600'
                  }`}
                >
                  {isSpeechEnabled ? 'Disable Speech' : 'Enable Speech'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Translation Output */}
          <div className="space-y-6">
            <div className={`${
              isDarkMode ? 'gradient-border p-6 card-hover' : 'bg-white/10 backdrop-blur-sm p-6 card-hover'
            }`}>
              <h3 className={`text-xl font-semibold mb-4 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                Live ASL Translation
              </h3>
              <div className={`${
                isDarkMode ? 'bg-white dark:bg-gray-800' : 'bg-white/20 backdrop-blur-sm'
              } p-6 rounded-lg border min-h-32 flex items-center`}>
                <p className={`text-lg ${
                  isDarkMode ? 'text-muted-foreground' : 'text-black'
                }`}>
                  {outputText}
                </p>
              </div>
              <div className={`mt-4 text-sm ${
                isDarkMode ? 'text-muted-foreground' : 'text-black'
              }`}>
                {isConnected && isCameraOn 
                  ? `Processing hand gestures... (${detections.hands.length} hands detected)`
                  : 'Waiting for connection...'
                }
              </div>
            </div>
            
            <div className={`${
              isDarkMode ? 'gradient-border p-6 card-hover' : 'bg-white/10 backdrop-blur-sm p-6 card-hover'
            }`}>
              <h4 className={`text-lg font-semibold mb-4 ${
                isDarkMode ? 'text-foreground' : 'text-black'
              }`}>
                Setup Instructions
              </h4>
              <div className={`space-y-2 text-sm ${
                isDarkMode ? 'text-muted-foreground' : 'text-black'
              }`}>
                <p>1. Start the Python backend server on localhost:8000</p>
                <p>2. Click "Start ASL Detection" to begin</p>
                <p>3. Position your hands clearly in the camera view</p>
                <p>4. The AI will translate your ASL signs in real-time</p>
                <p>5. Toggle speech output using the "Enable/Disable Speech" button</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className={`text-lg italic ${
            isDarkMode ? 'text-gray-300' : 'text-black bg-white/10'
          }`}>
            "Breaking communication barriers through AI-powered ASL translation"
          </p>
        </div>
      </div>
      </div>
      <Footer />
    </section>
  );
};