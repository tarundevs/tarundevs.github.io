# asl_server_debug.py - ASL Server with Debug Info for Real vs Mock Predictions
import asyncio
import websockets
import json
import base64
import logging
from datetime import datetime
import time
import numpy as np
from PIL import Image
import io
import os
from pathlib import Path

# PyTorch imports for ASL classification
import torch
import torch.nn as nn
import torchvision.transforms as transforms

# Try to import the real ASL classifier
try:
    from models.asl_classifier import ASLClassifier, load_asl_classifier
    REAL_CLASSIFIER_AVAILABLE = True
    print("✅ Real ASL Classifier module found!")
except ImportError as e:
    REAL_CLASSIFIER_AVAILABLE = False
    print(f"❌ Real ASL Classifier not available: {e}")
    print("💡 Will use mock predictions only")

# Set up enhanced logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%H:%M:%S'
)
logger = logging.getLogger(__name__)

class DebugASLServer:
    """ASL Server with debug info to show real vs mock predictions"""
    
    def __init__(self, weights_dir='weights', force_mock=False):
        self.connected_clients = set()
        self.frame_count = 0
        self.total_data_received = 0
        self.start_time = time.time()
        self.last_frame_time = None
        
        # Device setup
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        logger.info(f"🔧 Using device: {self.device}")
        
        # Prediction mode setup
        self.force_mock = force_mock
        self.weights_dir = Path(weights_dir)
        self.real_classifier = None
        self.using_real_classifier = False
        
        # ASL prediction tracking
        self.recent_predictions = []
        self.prediction_buffer_size = 5
        self.confidence_threshold = 0.7
        
        # ASL signs vocabulary
        self.asl_signs = [
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
            'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
        ]
        
        # Initialize classifier
        self._setup_classifier()
        
        logger.info("✅ Debug ASL Server initialized")
        
    def _setup_classifier(self):
        """Setup real or mock classifier with debug info"""
        print("\n" + "="*60)
        print("🔍 CLASSIFIER SETUP DEBUG")
        print("="*60)
        
        # Check if forced to use mock
        if self.force_mock:
            print("🎭 FORCED MOCK MODE: force_mock=True")
            self.using_real_classifier = False
            return
        
        # Check if real classifier is available
        if not REAL_CLASSIFIER_AVAILABLE:
            print("❌ REAL CLASSIFIER MODULE NOT AVAILABLE")
            print("   - asl_classifier.py not found or has import errors")
            print("   - Using mock predictions")
            self.using_real_classifier = False
            return
        
        # Check for weights directory
        if not self.weights_dir.exists():
            print(f"📁 WEIGHTS DIRECTORY NOT FOUND: {self.weights_dir}")
            print("   - Real classifier needs weights directory")
            print("   - Using mock predictions")
            self.using_real_classifier = False
            return
        
        # Check for required files
        model_file = self.weights_dir / 'best_asl_fingerspelling_model.pth'
        vocab_file = self.weights_dir / 'vocabulary.pkl'
        
        print(f"📁 Weights directory: {self.weights_dir}")
        print(f"🧠 Model file exists: {model_file.exists()} - {model_file}")
        print(f"📚 Vocab file exists: {vocab_file.exists()} - {vocab_file}")
        
        if not model_file.exists():
            print("❌ MODEL FILE MISSING")
            print("   - best_asl_fingerspelling_model.pth not found")
            print("   - Using mock predictions")
            self.using_real_classifier = False
            return
            
        if not vocab_file.exists():
            print("❌ VOCABULARY FILE MISSING")
            print("   - vocabulary.pkl not found")
            print("   - Using mock predictions")
            self.using_real_classifier = False
            return
        
        # Try to load real classifier
        try:
            print("🔄 ATTEMPTING TO LOAD REAL CLASSIFIER...")
            self.real_classifier = load_asl_classifier(
                weights_dir=str(self.weights_dir), 
                device=self.device
            )
            self.using_real_classifier = True
            print("✅ REAL CLASSIFIER LOADED SUCCESSFULLY!")
            
            # Get classifier info
            info = self.real_classifier.get_model_info()
            print(f"📊 Model classes: {info['num_classes']}")
            print(f"🔤 Supported characters: {info['supported_characters']}")
            print(f"🖥️ Device: {info['device']}")
            
        except Exception as e:
            print(f"❌ FAILED TO LOAD REAL CLASSIFIER: {e}")
            print("   - Will use mock predictions")
            self.using_real_classifier = False
            self.real_classifier = None
        
        print("="*60)
        print(f"🎯 FINAL MODE: {'REAL CLASSIFIER' if self.using_real_classifier else 'MOCK PREDICTIONS'}")
        print("="*60)
    
    def predict_asl_from_hand_regions(self, hand_regions):
        """Process hand regions with debug info about prediction method"""
        predictions = []
        
        try:
            for i, hand_region in enumerate(hand_regions):
                try:
                    # Decode base64 image data
                    image_data = base64.b64decode(hand_region['image'])
                    hand_image = Image.open(io.BytesIO(image_data))
                    
                    # Get hand info
                    bbox = hand_region['bbox']
                    label = hand_region.get('label', 'Unknown')
                    mediapipe_confidence = hand_region.get('confidence', 0.0)
                    
                    # Generate prediction based on mode
                    if self.using_real_classifier:
                        # REAL PREDICTION MODE
                        logger.info(f"🤖 Using REAL CLASSIFIER for hand {i+1}")
                        
                        try:
                            # Use real classifier
                            real_result = self.real_classifier.predict(hand_image, return_top_k=3)
                            
                            predicted_sign = real_result['predicted_sign']
                            confidence = real_result['confidence']
                            top_3 = real_result['top_k']
                            
                            prediction_method = "REAL_CLASSIFIER"
                            
                        except Exception as classifier_error:
                            logger.error(f"❌ Real classifier failed: {classifier_error}")
                            # Fallback to mock
                            predicted_sign = self.generate_mock_prediction(hand_region)
                            confidence = 0.5 + (np.random.random() * 0.3)
                            top_3 = self.generate_top_3_predictions(predicted_sign, confidence)
                            prediction_method = "REAL_CLASSIFIER_FAILED_FALLBACK_MOCK"
                    
                    else:
                        # MOCK PREDICTION MODE
                        logger.info(f"🎭 Using MOCK PREDICTIONS for hand {i+1}")
                        
                        predicted_sign = self.generate_mock_prediction(hand_region)
                        base_confidence = 0.75 + (mediapipe_confidence * 0.15)
                        confidence = base_confidence + (np.random.random() * 0.1 - 0.05)
                        confidence = max(0.5, min(0.95, confidence))
                        top_3 = self.generate_top_3_predictions(predicted_sign, confidence)
                        prediction_method = "MOCK_PREDICTIONS"
                    
                    # Create prediction result with debug info
                    prediction = {
                        'hand_index': i,
                        'predicted_sign': predicted_sign,
                        'confidence': confidence,
                        'top_k': top_3,
                        'hand_info': {
                            'label': label,
                            'mediapipe_confidence': mediapipe_confidence,
                            'bbox': bbox,
                            'image_size': hand_image.size
                        },
                        'debug_info': {
                            'prediction_method': prediction_method,
                            'using_real_classifier': self.using_real_classifier,
                            'real_classifier_available': REAL_CLASSIFIER_AVAILABLE,
                            'weights_dir_exists': self.weights_dir.exists(),
                            'force_mock': self.force_mock
                        }
                    }
                    
                    predictions.append(prediction)
                    
                    # Enhanced logging with debug info
                    logger.info(f"🤟 Hand {i+1} ({label}): {predicted_sign} "
                              f"(conf: {confidence:.2f}) [{prediction_method}]")
                    
                except Exception as e:
                    logger.error(f"❌ Error processing hand region {i}: {e}")
                    predictions.append({
                        'hand_index': i,
                        'predicted_sign': 'ERROR',
                        'confidence': 0.0,
                        'top_k': [],
                        'error': str(e),
                        'hand_info': hand_region,
                        'debug_info': {
                            'prediction_method': 'ERROR',
                            'error_details': str(e)
                        }
                    })
                    
        except Exception as e:
            logger.error(f"❌ Error in predict_asl_from_hand_regions: {e}")
            
        return predictions

    def generate_mock_prediction(self, hand_region):
        """Generate mock predictions (same as before)"""
        common_signs = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'L', 'O', 'V', 'Y']
        bbox = hand_region['bbox']
        hand_center_x = (bbox['x'] + bbox['width'] / 2)
        sign_index = int(hand_center_x / 50) % len(common_signs)
        return common_signs[sign_index]
    
    def generate_top_3_predictions(self, primary_sign, primary_confidence):
        """Generate top 3 predictions (same as before)"""
        top_3 = [{'sign': primary_sign, 'confidence': primary_confidence}]
        
        remaining_signs = [s for s in self.asl_signs if s != primary_sign]
        for i in range(2):
            sign = np.random.choice(remaining_signs)
            conf = primary_confidence - (0.15 + np.random.random() * 0.1) * (i + 1)
            top_3.append({
                'sign': sign,
                'confidence': max(0.1, conf)
            })
            remaining_signs.remove(sign)
        
        return top_3
    
    def stabilize_predictions(self, new_predictions):
        """Same stabilization logic as before"""
        try:
            self.recent_predictions.append({
                'predictions': new_predictions,
                'timestamp': time.time()
            })
            
            if len(self.recent_predictions) > self.prediction_buffer_size:
                self.recent_predictions.pop(0)
            
            if len(self.recent_predictions) < 3:
                if new_predictions:
                    return new_predictions[0]['predicted_sign']
                else:
                    return "Show hands to camera..."
            
            sign_counts = {}
            total_confidence = {}
            
            for pred_frame in self.recent_predictions:
                for pred in pred_frame['predictions']:
                    if pred['confidence'] >= self.confidence_threshold:
                        sign = pred['predicted_sign']
                        sign_counts[sign] = sign_counts.get(sign, 0) + 1
                        total_confidence[sign] = total_confidence.get(sign, 0) + pred['confidence']
            
            if sign_counts:
                best_sign = max(sign_counts.keys(), 
                              key=lambda x: (sign_counts[x], total_confidence[x]))
                
                if sign_counts[best_sign] >= len(self.recent_predictions) * 0.6:
                    avg_confidence = total_confidence[best_sign] / sign_counts[best_sign]
                    logger.info(f"🎯 Stabilized: {best_sign} (avg conf: {avg_confidence:.2f})")
                    return best_sign
            
            return "Processing..." if new_predictions else "No hands detected"
            
        except Exception as e:
            logger.error(f"❌ Prediction stabilization error: {e}")
            return "Error in processing"
    
    async def process_frame(self, websocket, message_data):
        """Process frame with enhanced debug info"""
        try:
            self.frame_count += 1
            current_time = time.time()
            
            fps = 1.0 / (current_time - self.last_frame_time) if self.last_frame_time else 0
            self.last_frame_time = current_time
            
            frame_data_size = len(base64.b64decode(message_data['data']))
            self.total_data_received += frame_data_size
            
            frame_info = message_data.get('frameInfo', {})
            hand_regions = message_data.get('handRegions', [])
            
            logger.info(f"📸 Frame {self.frame_count}: {frame_info.get('width', 'Unknown')}x{frame_info.get('height', 'Unknown')} "
                       f"| {len(hand_regions)} hands | FPS: {fps:.1f}")
            
            predictions = []
            
            if hand_regions:
                logger.info(f"🖐️ Processing {len(hand_regions)} hand regions")
                predictions = self.predict_asl_from_hand_regions(hand_regions)
            else:
                logger.info("👐 No hand regions received from frontend")
            
            stabilized_text = self.stabilize_predictions(predictions)
            
            # Enhanced response with debug info
            response = {
                'type': 'asl_prediction',
                'text': stabilized_text,
                'predictions': predictions,
                'debug_info': {
                    'classifier_mode': 'REAL' if self.using_real_classifier else 'MOCK',
                    'real_classifier_available': REAL_CLASSIFIER_AVAILABLE,
                    'weights_dir_exists': self.weights_dir.exists(),
                    'force_mock': self.force_mock,
                    'total_predictions_made': len(predictions)
                },
                'frame_info': {
                    'frame_number': self.frame_count,
                    'fps': round(fps, 1),
                    'hands_detected': len(predictions),
                    'image_size': [frame_info.get('width', 0), frame_info.get('height', 0)],
                    'processing_time': round((time.time() - current_time) * 1000, 1),
                    'frame_data_kb': round(frame_data_size / 1024, 1)
                },
                'hand_regions_info': [
                    {
                        'label': region['label'],
                        'confidence': region['confidence'],
                        'bbox_size': f"{region['bbox']['width']}x{region['bbox']['height']}"
                    }
                    for region in hand_regions
                ],
                'server_stats': {
                    'total_frames': self.frame_count,
                    'uptime_seconds': round(time.time() - self.start_time, 1),
                    'data_received_mb': round(self.total_data_received / (1024 * 1024), 2),
                    'avg_fps': round(self.frame_count / (time.time() - self.start_time), 1)
                },
                'timestamp': current_time
            }
            
            await websocket.send(json.dumps(response))
            
            # Debug log
            mode = "REAL" if self.using_real_classifier else "MOCK"
            logger.info(f"📤 Response sent: '{stabilized_text}' [{mode} mode]")
            
        except Exception as e:
            logger.error(f"❌ Frame processing error: {e}")
            error_response = {
                'type': 'error',
                'text': 'Error processing frame',
                'error': str(e),
                'debug_info': {
                    'classifier_mode': 'REAL' if self.using_real_classifier else 'MOCK',
                    'error_location': 'process_frame'
                },
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(error_response))
    
    async def handle_client(self, websocket):
        """Handle client with debug info in welcome message"""
        client_address = websocket.remote_address
        logger.info(f"🔌 New client connected: {client_address}")
        self.connected_clients.add(websocket)
        
        try:
            # Enhanced welcome message with debug info
            welcome_message = {
                'type': 'welcome',
                'text': f'Connected to Debug ASL Server ({("REAL CLASSIFIER" if self.using_real_classifier else "MOCK PREDICTIONS")})',
                'server_info': {
                    'hand_detection': 'Frontend MediaPipe',
                    'asl_classification': 'REAL PyTorch Model' if self.using_real_classifier else 'Mock Predictions',
                    'device': str(self.device),
                    'supported_signs': len(self.asl_signs),
                    'prediction_buffer_size': self.prediction_buffer_size
                },
                'debug_info': {
                    'classifier_mode': 'REAL' if self.using_real_classifier else 'MOCK',
                    'real_classifier_available': REAL_CLASSIFIER_AVAILABLE,
                    'weights_dir': str(self.weights_dir),
                    'weights_dir_exists': self.weights_dir.exists(),
                    'force_mock': self.force_mock,
                    'model_files': {
                        'model_file_exists': (self.weights_dir / 'best_asl_fingerspelling_model.pth').exists(),
                        'vocab_file_exists': (self.weights_dir / 'vocabulary.pkl').exists()
                    }
                },
                'instructions': [
                    'Hand detection is handled by your browser using MediaPipe',
                    f'ASL classification: {("Real PyTorch model" if self.using_real_classifier else "Mock predictions for demo")}',
                    'Check debug_info in responses to see prediction method',
                    'Show clear ASL signs to the camera for best results'
                ],
                'timestamp': time.time()
            }
            await websocket.send(json.dumps(welcome_message))
            
            # Process messages (same as before)
            async for message in websocket:
                try:
                    data = json.loads(message)
                    
                    if data.get('type') == 'frame':
                        await self.process_frame(websocket, data)
                    elif data.get('type') == 'ping':
                        pong_response = {
                            'type': 'pong',
                            'server_status': 'healthy',
                            'connected_clients': len(self.connected_clients),
                            'uptime': time.time() - self.start_time,
                            'debug_info': {
                                'classifier_mode': 'REAL' if self.using_real_classifier else 'MOCK'
                            },
                            'timestamp': time.time()
                        }
                        await websocket.send(json.dumps(pong_response))
                    else:
                        logger.warning(f"⚠️ Unknown message type: {data.get('type')}")
                        
                except json.JSONDecodeError as e:
                    logger.error(f"❌ JSON decode error: {e}")
                except Exception as e:
                    logger.error(f"❌ Message processing error: {e}")
                    
        except websockets.exceptions.ConnectionClosed:
            logger.info(f"🔌 Client disconnected: {client_address}")
        except Exception as e:
            logger.error(f"❌ Client handling error: {e}")
        finally:
            self.connected_clients.discard(websocket)
            logger.info(f"🧹 Connection cleaned up: {client_address}")
    
    async def start_server(self, host='localhost', port=8000):
        """Start server with enhanced debug info"""
        logger.info("=" * 60)
        logger.info("🚀 DEBUG ASL SERVER STARTING")
        logger.info("=" * 60)
        logger.info(f"📡 Host: {host}:{port}")
        logger.info(f"🔧 Device: {self.device}")
        logger.info(f"🖐️ Hand Detection: Frontend MediaPipe Only")
        logger.info(f"🤟 ASL Classification: {('REAL PyTorch Model' if self.using_real_classifier else 'MOCK PREDICTIONS')}")
        logger.info(f"📊 Supported Signs: {len(self.asl_signs)}")
        logger.info(f"📁 Weights Directory: {self.weights_dir} ({'EXISTS' if self.weights_dir.exists() else 'MISSING'})")
        logger.info("=" * 60)
        
        server = await websockets.serve(
            self.handle_client,
            host,
            port,
            ping_interval=20,
            ping_timeout=10,
            max_size=10 * 1024 * 1024
        )
        
        logger.info(f"✅ Server is running and ready!")
        logger.info(f"🌐 WebSocket URL: ws://{host}:{port}")
        logger.info(f"🎯 Mode: {('REAL CLASSIFIER' if self.using_real_classifier else 'MOCK PREDICTIONS')}")
        
        try:
            await server.wait_closed()
        except KeyboardInterrupt:
            logger.info("🛑 Server shutdown requested by user")
        finally:
            server.close()
            await server.wait_closed()
            logger.info("✅ Server shutdown complete")

def main():
    """Main function with command line options"""
    import argparse
    
    parser = argparse.ArgumentParser(description='Debug ASL Server')
    parser.add_argument('--weights-dir', default='weights', 
                       help='Directory containing model weights (default: weights)')
    parser.add_argument('--force-mock', action='store_true',
                       help='Force mock predictions even if real classifier is available')
    parser.add_argument('--host', default='localhost', help='Server host')
    parser.add_argument('--port', type=int, default=8000, help='Server port')
    
    args = parser.parse_args()
    
    print("🤟 Debug ASL Server")
    print("📱 Frontend MediaPipe + Backend ASL Classification")
    print("🔍 With Real/Mock Detection")
    print("-" * 50)
    
    try:
        server = DebugASLServer(
            weights_dir=args.weights_dir,
            force_mock=args.force_mock
        )
        
        asyncio.run(server.start_server(host=args.host, port=args.port))
        
    except KeyboardInterrupt:
        logger.info("🛑 Server interrupted by user")
    except Exception as e:
        logger.error(f"❌ Server startup error: {e}")
        logger.error("💡 Make sure port is available and weights directory exists")
    finally:
        logger.info("👋 Debug ASL Server stopped")

if __name__ == "__main__":
    main()