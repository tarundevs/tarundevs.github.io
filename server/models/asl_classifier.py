# asl_classifier.py - ASL Fingerspelling Classification Model (Updated for train.py compatibility)
import os
import torch
import torch.nn as nn
import torchvision.transforms as transforms
import torchvision.models as models
import pickle
import numpy as np
from PIL import Image
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class TinyASLNet(nn.Module):
    """Extremely lightweight model for fastest training - matches train.py"""
    
    def __init__(self, num_classes, pretrained=True):
        super(TinyASLNet, self).__init__()
        
        # Use MobileNetV2 - very fast (same as train.py)
        self.backbone = models.mobilenet_v2(pretrained=pretrained)
        
        # Replace classifier (same as train.py)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.1),
            nn.Linear(in_features, num_classes)
        )
        
        # Freeze backbone for transfer learning (same as train.py)
        if pretrained:
            for param in self.backbone.features.parameters():
                param.requires_grad = False
    
    def forward(self, x):
        return self.backbone(x)

class FastASLNet(nn.Module):
    """Ultra-fast ASL model using EfficientNet-B0 - matches train.py"""
    
    def __init__(self, num_classes, pretrained=True, dropout=0.2):
        super(FastASLNet, self).__init__()
        
        # Use EfficientNet-B0 - much faster than MobileNetV3 (same as train.py)
        from torchvision.models import efficientnet_b0
        self.backbone = efficientnet_b0(pretrained=pretrained)
        
        # Replace classifier with lighter version (same as train.py)
        in_features = self.backbone.classifier[1].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(dropout),
            nn.Linear(in_features, num_classes)
        )
        
        # Freeze early layers for faster training (same as train.py)
        if pretrained:
            for param in list(self.backbone.parameters())[:-4]:  # Freeze all but last 4 layers
                param.requires_grad = False
    
    def forward(self, x):
        return self.backbone(x)

class EfficientASLNet(nn.Module):
    """Efficient CNN model using MobileNetV3 backbone (legacy - kept for compatibility)"""
    
    def __init__(self, num_classes, pretrained=True):
        super(EfficientASLNet, self).__init__()
        
        # Use MobileNetV3 as backbone (much faster than custom CNN)
        self.backbone = models.mobilenet_v3_small(pretrained=pretrained)
        
        # Replace classifier
        in_features = self.backbone.classifier[0].in_features
        self.backbone.classifier = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(in_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)

class ResNetASL(nn.Module):
    """ResNet-based model for ASL recognition (legacy - kept for compatibility)"""
    
    def __init__(self, num_classes, pretrained=True):
        super(ResNetASL, self).__init__()
        
        # Use ResNet18 as backbone (good balance of speed and accuracy)
        self.backbone = models.resnet18(pretrained=pretrained)
        
        # Replace final layer
        in_features = self.backbone.fc.in_features
        self.backbone.fc = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(in_features, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(256, num_classes)
        )
        
    def forward(self, x):
        return self.backbone(x)

class ASLFingerspellingCNN(nn.Module):
    """Original CNN model for ASL fingerspelling letter recognition (kept for compatibility)"""
    
    def __init__(self, num_classes):
        super(ASLFingerspellingCNN, self).__init__()
        
        # Feature extraction backbone
        self.features = nn.Sequential(
            # Block 1
            nn.Conv2d(3, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.Conv2d(64, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.1),
            
            # Block 2
            nn.Conv2d(64, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.Conv2d(128, 128, kernel_size=3, padding=1),
            nn.BatchNorm2d(128),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.2),
            
            # Block 3
            nn.Conv2d(128, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.Conv2d(256, 256, kernel_size=3, padding=1),
            nn.BatchNorm2d(256),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.3),
            
            # Block 4
            nn.Conv2d(256, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.Conv2d(512, 512, kernel_size=3, padding=1),
            nn.BatchNorm2d(512),
            nn.ReLU(inplace=True),
            nn.MaxPool2d(2, 2),
            nn.Dropout2d(0.4),
        )
        
        # Classifier head
        self.classifier = nn.Sequential(
            nn.AdaptiveAvgPool2d((7, 7)),
            nn.Flatten(),
            nn.Linear(512 * 7 * 7, 2048),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(2048, 1024),
            nn.ReLU(inplace=True),
            nn.Dropout(0.5),
            nn.Linear(1024, num_classes)
        )
        
    def forward(self, x):
        x = self.features(x)
        x = self.classifier(x)
        return x

class ASLClassifier:
    """ASL Fingerspelling Classifier for inference (Compatible with train.py models)"""
    
    def __init__(self, weights_dir='.', device=None, model_type='tiny'):
        """
        Initialize the ASL classifier
        
        Args:
            weights_dir (str): Directory containing model weights and vocabulary
            device: PyTorch device (auto-detected if None)
            model_type (str): Type of model ('tiny', 'fast', 'efficient', 'resnet', or 'custom')
        """
        self.weights_dir = Path(weights_dir)
        self.device = device or torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model_type = model_type
        
        # Model components
        self.model = None
        self.char_to_idx = None
        self.idx_to_char = None
        self.num_classes = None
        self.img_size = 224  # Default image size
        
        # Preprocessing transform (will be updated based on model)
        self.transform = None
        
        # Load model and vocabulary
        self._load_model()
        
        logger.info(f"✅ ASL Classifier initialized on {self.device}")
        logger.info(f"🏗️ Model type: {self.model_type}")
        logger.info(f"📚 Vocabulary size: {self.num_classes} characters")
        logger.info(f"🔤 Supported characters: {sorted(self.char_to_idx.keys())}")
    
    def _create_transform(self, img_size=224):
        """Create preprocessing transform based on image size"""
        return transforms.Compose([
            transforms.Resize(img_size + 32),
            transforms.CenterCrop(img_size),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
    
    def _load_model(self):
        """Load the trained model and vocabulary"""
        try:
            # Load vocabulary - try different formats in order of preference
            vocab_paths = [
                self.weights_dir / 'vocabulary_fast.pkl',       # From train.py (fast trainer)
                self.weights_dir / 'vocabulary_optimized.pkl',  # From getChicagoFSWild.py
                self.weights_dir / 'vocabulary.pkl'             # Original format
            ]
            
            vocab_path = None
            for path in vocab_paths:
                if path.exists():
                    vocab_path = path
                    break
            
            if vocab_path is None:
                raise FileNotFoundError(f"Vocabulary file not found. Tried: {vocab_paths}")
            
            with open(vocab_path, 'rb') as f:
                vocab_info = pickle.load(f)
            
            self.char_to_idx = vocab_info['char_to_idx']
            self.idx_to_char = vocab_info['idx_to_char']
            self.num_classes = vocab_info['num_classes']
            
            logger.info(f"📚 Loaded vocabulary from {vocab_path.name} with {self.num_classes} classes")
            
            # Initialize model based on type
            if self.model_type == 'tiny':
                self.model = TinyASLNet(num_classes=self.num_classes, pretrained=False)
            elif self.model_type == 'fast':
                self.model = FastASLNet(num_classes=self.num_classes, pretrained=False)
            elif self.model_type == 'efficient':
                self.model = EfficientASLNet(num_classes=self.num_classes, pretrained=False)
            elif self.model_type == 'resnet':
                self.model = ResNetASL(num_classes=self.num_classes, pretrained=False)
            else:  # custom/original
                self.model = ASLFingerspellingCNN(num_classes=self.num_classes)
            
            # Load model weights - try different formats in order of preference
            model_paths = [
                self.weights_dir / 'best_fast_asl_model.pth',               # From train.py (fast trainer)
                self.weights_dir / 'best_asl_model.pth',                    # From getChicagoFSWild.py
                self.weights_dir / 'best_asl_fingerspelling_model.pth'     # Original format
            ]
            
            model_path = None
            for path in model_paths:
                if path.exists():
                    model_path = path
                    break
            
            if model_path is None:
                raise FileNotFoundError(f"Model weights not found. Tried: {model_paths}")
            
            checkpoint = torch.load(model_path, map_location=self.device)
            
            # Handle different checkpoint formats
            if 'model_state_dict' in checkpoint:
                self.model.load_state_dict(checkpoint['model_state_dict'])
                
                # Get image size from checkpoint if available (from train.py)
                if 'img_size' in checkpoint:
                    self.img_size = checkpoint['img_size']
                    logger.info(f"🖼️ Using image size from checkpoint: {self.img_size}x{self.img_size}")
                
                # Get model type from checkpoint if available
                if 'model_type' in checkpoint and self.model_type != checkpoint['model_type']:
                    logger.warning(f"⚠️ Model type mismatch: requested {self.model_type}, "
                                 f"checkpoint has {checkpoint['model_type']}")
            else:
                self.model.load_state_dict(checkpoint)
            
            # Create transform with the correct image size
            self.transform = self._create_transform(self.img_size)
            
            self.model.to(self.device)
            self.model.eval()
            
            logger.info(f"🎯 Loaded model from {model_path.name}")
            
            # Log model info if available
            if 'val_acc' in checkpoint:
                logger.info(f"📊 Model validation accuracy: {checkpoint['val_acc']:.2f}%")
            if 'epoch' in checkpoint:
                logger.info(f"📈 Training completed at epoch: {checkpoint['epoch']}")
            
            # Count model parameters
            total_params = sum(p.numel() for p in self.model.parameters())
            trainable_params = sum(p.numel() for p in self.model.parameters() if p.requires_grad)
            logger.info(f"🧠 Model parameters: {total_params:,} (trainable: {trainable_params:,})")
            
        except Exception as e:
            logger.error(f"❌ Failed to load model: {e}")
            raise
    
    def preprocess_image(self, image):
        """
        Preprocess image for model inference
        
        Args:
            image: PIL Image, numpy array, or torch tensor
            
        Returns:
            torch.Tensor: Preprocessed image tensor
        """
        try:
            # Convert to PIL Image if needed
            if isinstance(image, np.ndarray):
                if image.dtype == np.uint8:
                    image = Image.fromarray(image)
                else:
                    # Assume float array in [0, 1]
                    image = Image.fromarray((image * 255).astype(np.uint8))
            elif isinstance(image, torch.Tensor):
                # Convert tensor to PIL Image
                if image.dim() == 4:  # Batch dimension
                    image = image.squeeze(0)
                if image.dim() == 3 and image.shape[0] == 3:  # CHW format
                    image = image.permute(1, 2, 0)
                
                # Convert to numpy then PIL
                if image.is_cuda:
                    image = image.cpu()
                image_np = image.numpy()
                if image_np.max() <= 1.0:
                    image_np = (image_np * 255).astype(np.uint8)
                image = Image.fromarray(image_np)
            
            # Ensure RGB format
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Apply preprocessing transforms
            tensor = self.transform(image)
            
            # Add batch dimension
            if tensor.dim() == 3:
                tensor = tensor.unsqueeze(0)
            
            return tensor.to(self.device)
            
        except Exception as e:
            logger.error(f"❌ Image preprocessing error: {e}")
            raise
    
    def predict(self, image, return_top_k=3):
        """
        Predict ASL sign from image
        
        Args:
            image: Input image (PIL Image, numpy array, or torch tensor)
            return_top_k (int): Number of top predictions to return
            
        Returns:
            dict: Prediction results containing:
                - predicted_sign: Most likely character
                - confidence: Confidence score (0-1)
                - top_k: List of top-k predictions with scores
        """
        try:
            # Preprocess image
            input_tensor = self.preprocess_image(image)
            
            # Model inference with mixed precision if available
            with torch.no_grad():
                if self.device.type == 'cuda':
                    with torch.cuda.amp.autocast():
                        outputs = self.model(input_tensor)
                else:
                    outputs = self.model(input_tensor)
                
                probabilities = torch.softmax(outputs, dim=1)
                
                # Get top predictions
                top_probs, top_indices = torch.topk(probabilities, 
                                                   min(return_top_k, self.num_classes), 
                                                   dim=1)
                
                # Convert to lists
                top_probs = top_probs.squeeze().cpu().numpy()
                top_indices = top_indices.squeeze().cpu().numpy()
                
                # Handle single prediction case
                if isinstance(top_probs, (int, float)):
                    top_probs = [float(top_probs)]
                    top_indices = [int(top_indices)]
                else:
                    top_probs = top_probs.tolist()
                    top_indices = top_indices.tolist()
                
                # Build results
                top_k_predictions = []
                for i, (prob, idx) in enumerate(zip(top_probs, top_indices)):
                    char = self.idx_to_char[idx]
                    top_k_predictions.append({
                        'sign': char,
                        'confidence': float(prob),
                        'rank': i + 1
                    })
                
                # Primary prediction
                primary_prediction = top_k_predictions[0]
                
                results = {
                    'predicted_sign': primary_prediction['sign'],
                    'confidence': primary_prediction['confidence'],
                    'top_k': top_k_predictions,
                    'model_info': {
                        'num_classes': self.num_classes,
                        'device': str(self.device),
                        'input_shape': list(input_tensor.shape),
                        'model_type': self.model_type,
                        'img_size': self.img_size
                    }
                }
                
                logger.debug(f"🤟 Predicted: {results['predicted_sign']} "
                           f"(conf: {results['confidence']:.3f})")
                
                return results
                
        except Exception as e:
            logger.error(f"❌ Prediction error: {e}")
            return {
                'predicted_sign': 'ERROR',
                'confidence': 0.0,
                'top_k': [],
                'error': str(e)
            }
    
    def predict_batch(self, images, return_top_k=3):
        """
        Predict ASL signs for a batch of images
        
        Args:
            images: List of images or batch tensor
            return_top_k (int): Number of top predictions to return
            
        Returns:
            list: List of prediction results for each image
        """
        try:
            if isinstance(images, (list, tuple)):
                # Process list of images
                results = []
                for image in images:
                    result = self.predict(image, return_top_k)
                    results.append(result)
                return results
            else:
                # Assume batch tensor
                batch_tensor = images.to(self.device)
                batch_size = batch_tensor.shape[0]
                
                with torch.no_grad():
                    # Mixed precision inference
                    if self.device.type == 'cuda':
                        with torch.cuda.amp.autocast():
                            outputs = self.model(batch_tensor)
                    else:
                        outputs = self.model(batch_tensor)
                    
                    probabilities = torch.softmax(outputs, dim=1)
                    
                    # Get top predictions for each sample in batch
                    top_probs, top_indices = torch.topk(probabilities, 
                                                       min(return_top_k, self.num_classes), 
                                                       dim=1)
                    
                    results = []
                    for i in range(batch_size):
                        sample_probs = top_probs[i].cpu().numpy()
                        sample_indices = top_indices[i].cpu().numpy()
                        
                        top_k_predictions = []
                        for j, (prob, idx) in enumerate(zip(sample_probs, sample_indices)):
                            char = self.idx_to_char[idx]
                            top_k_predictions.append({
                                'sign': char,
                                'confidence': float(prob),
                                'rank': j + 1
                            })
                        
                        results.append({
                            'predicted_sign': top_k_predictions[0]['sign'],
                            'confidence': top_k_predictions[0]['confidence'],
                            'top_k': top_k_predictions
                        })
                    
                    return results
                    
        except Exception as e:
            logger.error(f"❌ Batch prediction error: {e}")
            return [{'predicted_sign': 'ERROR', 'confidence': 0.0, 'top_k': [], 'error': str(e)}] * len(images)
    
    def get_model_info(self):
        """Get model information"""
        return {
            'num_classes': self.num_classes,
            'supported_characters': sorted(self.char_to_idx.keys()),
            'device': str(self.device),
            'model_architecture': self.model.__class__.__name__,
            'model_type': self.model_type,
            'input_size': [self.img_size, self.img_size],
            'weights_dir': str(self.weights_dir)
        }
    
    def warmup(self, num_iterations=5):
        """
        Warm up the model with dummy predictions for optimal performance
        
        Args:
            num_iterations (int): Number of warmup iterations
        """
        logger.info(f"🔥 Warming up model with {num_iterations} iterations...")
        
        try:
            # Create dummy input with correct size
            dummy_input = torch.randn(1, 3, self.img_size, self.img_size).to(self.device)
            
            with torch.no_grad():
                for i in range(num_iterations):
                    if self.device.type == 'cuda':
                        with torch.cuda.amp.autocast():
                            _ = self.model(dummy_input)
                    else:
                        _ = self.model(dummy_input)
            
            logger.info("✅ Model warmup completed")
            
        except Exception as e:
            logger.warning(f"⚠️ Model warmup failed: {e}")

# Convenience functions for easy model loading
def load_asl_classifier(weights_dir='.', device=None, model_type='tiny'):
    """
    Load ASL classifier with error handling
    
    Args:
        weights_dir (str): Directory containing model weights
        device: PyTorch device
        model_type (str): Type of model ('tiny', 'fast', 'efficient', 'resnet', or 'custom')
        
    Returns:
        ASLClassifier: Loaded classifier instance
    """
    try:
        classifier = ASLClassifier(weights_dir=weights_dir, device=device, model_type=model_type)
        classifier.warmup()  # Warm up for better performance
        return classifier
    except Exception as e:
        logger.error(f"❌ Failed to load ASL classifier: {e}")
        raise

def load_tiny_asl_classifier(weights_dir='.', device=None):
    """Load the tiny MobileNetV2-based classifier (from train.py)"""
    return load_asl_classifier(weights_dir, device, 'tiny')

def load_fast_asl_classifier(weights_dir='.', device=None):
    """Load the fast EfficientNet-B0-based classifier (from train.py)"""
    return load_asl_classifier(weights_dir, device, 'fast')

def load_efficient_asl_classifier(weights_dir='.', device=None):
    """Load the efficient MobileNetV3-based classifier (legacy)"""
    return load_asl_classifier(weights_dir, device, 'efficient')

def load_resnet_asl_classifier(weights_dir='.', device=None):
    """Load the ResNet18-based classifier (legacy)"""
    return load_asl_classifier(weights_dir, device, 'resnet')

# Example usage and testing
if __name__ == "__main__":
    # Set up logging
    logging.basicConfig(level=logging.INFO)
    
    try:
        # Load classifier (try tiny model first - matches train.py default)
        print("🤟 Loading ASL Classifier (Tiny Model from train.py)...")
        classifier = load_tiny_asl_classifier()
        
        # Print model info
        info = classifier.get_model_info()
        print("\n📋 Model Information:")
        for key, value in info.items():
            print(f"  {key}: {value}")
        
        # Test with dummy image
        print("\n🧪 Testing with dummy image...")
        dummy_image = Image.new('RGB', (classifier.img_size, classifier.img_size), color='white')
        
        result = classifier.predict(dummy_image, return_top_k=5)
        
        print(f"\n🎯 Prediction Results:")
        print(f"  Primary: {result['predicted_sign']} ({result['confidence']:.3f})")
        print(f"  Top 5:")
        for pred in result['top_k']:
            print(f"    {pred['rank']}. {pred['sign']}: {pred['confidence']:.3f}")
        
        print("\n✅ ASL Classifier test completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("💡 Make sure the current directory contains:")
        print("   - best_fast_asl_model.pth (from train.py)")
        print("   - vocabulary_fast.pkl (from train.py)")
        print("   OR other compatible model files")
        print("\n🔧 Available model types:")
        print("   - 'tiny': TinyASLNet (MobileNetV2) - matches train.py")
        print("   - 'fast': FastASLNet (EfficientNet-B0) - matches train.py")
        print("   - 'efficient': EfficientASLNet (MobileNetV3) - legacy")
        print("   - 'resnet': ResNetASL (ResNet18) - legacy")
        print("   - 'custom': ASLFingerspellingCNN - original custom model")