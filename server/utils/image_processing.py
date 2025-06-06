# utils/image_processing.py - Image Processing Utilities for ASL Server
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import cv2
import torch
import torchvision.transforms as transforms
import logging

logger = logging.getLogger(__name__)

class ImageProcessor:
    """Image processing utilities for ASL detection and classification"""
    
    def __init__(self):
        # Standard transforms for ASL classification
        self.asl_transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],  # ImageNet statistics
                std=[0.229, 0.224, 0.225]
            )
        ])
        
        # YOLO preprocessing transforms
        self.yolo_transform = transforms.Compose([
            transforms.Resize((640, 640)),
            transforms.ToTensor(),
        ])
        
        logger.info("🖼️ Image processor initialized")
    
    def preprocess_for_asl(self, image):
        """
        Preprocess image for ASL classification
        Args:
            image: PIL Image
        Returns:
            torch.Tensor: Preprocessed image tensor
        """
        try:
            if not isinstance(image, Image.Image):
                raise ValueError("Input must be PIL Image")
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Enhance the image for better ASL recognition
            enhanced_image = self.enhance_for_hand_recognition(image)
            
            # Apply transforms
            tensor = self.asl_transform(enhanced_image)
            
            return tensor
            
        except Exception as e:
            logger.error(f"❌ ASL preprocessing error: {e}")
            raise
    
    def preprocess_for_yolo(self, image):
        """
        Preprocess image for YOLO detection
        Args:
            image: PIL Image
        Returns:
            torch.Tensor: Preprocessed image tensor
            tuple: Original image size (width, height)
        """
        try:
            if not isinstance(image, Image.Image):
                raise ValueError("Input must be PIL Image")
            
            # Store original size
            original_size = image.size
            
            # Convert to RGB if needed
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Apply YOLO transforms
            tensor = self.yolo_transform(image)
            
            return tensor, original_size
            
        except Exception as e:
            logger.error(f"❌ YOLO preprocessing error: {e}")
            raise
    
    def enhance_for_hand_recognition(self, image):
        """
        Enhance image specifically for better hand/ASL recognition
        Args:
            image: PIL Image
        Returns:
            PIL Image: Enhanced image
        """
        try:
            # Enhance contrast for better hand visibility
            contrast_enhancer = ImageEnhance.Contrast(image)
            image = contrast_enhancer.enhance(1.2)
            
            # Enhance sharpness for better edge definition
            sharpness_enhancer = ImageEnhance.Sharpness(image)
            image = sharpness_enhancer.enhance(1.1)
            
            # Slight brightness adjustment
            brightness_enhancer = ImageEnhance.Brightness(image)
            image = brightness_enhancer.enhance(1.05)
            
            return image
            
        except Exception as e:
            logger.warning(f"⚠️ Image enhancement failed: {e}")
            return image  # Return original if enhancement fails
    
    def crop_with_padding(self, image, bbox, padding=10):
        """
        Crop image region with padding
        Args:
            image: PIL Image
            bbox: [x_min, y_min, x_max, y_max]
            padding: Padding pixels around the bounding box
        Returns:
            PIL Image: Cropped region
        """
        try:
            x_min, y_min, x_max, y_max = bbox
            width, height = image.size
            
            # Add padding while staying within image bounds
            x_min = max(0, int(x_min - padding))
            y_min = max(0, int(y_min - padding))
            x_max = min(width, int(x_max + padding))
            y_max = min(height, int(y_max + padding))
            
            # Crop the region
            cropped = image.crop((x_min, y_min, x_max, y_max))
            
            # Ensure minimum size
            if cropped.size[0] < 32 or cropped.size[1] < 32:
                cropped = cropped.resize((64, 64), Image.Resampling.LANCZOS)
            
            return cropped
            
        except Exception as e:
            logger.error(f"❌ Cropping error: {e}")
            # Return a small default image if cropping fails
            return Image.new('RGB', (64, 64), color=(128, 128, 128))
    
    def resize_maintain_aspect_ratio(self, image, target_size):
        """
        Resize image while maintaining aspect ratio
        Args:
            image: PIL Image
            target_size: tuple (width, height)
        Returns:
            PIL Image: Resized image
        """
        try:
            target_width, target_height = target_size
            original_width, original_height = image.size
            
            # Calculate aspect ratios
            aspect_ratio = original_width / original_height
            target_aspect = target_width / target_height
            
            if aspect_ratio > target_aspect:
                # Image is wider than target
                new_width = target_width
                new_height = int(target_width / aspect_ratio)
            else:
                # Image is taller than target
                new_height = target_height
                new_width = int(target_height * aspect_ratio)
            
            # Resize image
            resized = image.resize((new_width, new_height), Image.Resampling.LANCZOS)
            
            # Create target size image with black background
            result = Image.new('RGB', target_size, color=(0, 0, 0))
            
            # Paste resized image in center
            x_offset = (target_width - new_width) // 2
            y_offset = (target_height - new_height) // 2
            result.paste(resized, (x_offset, y_offset))
            
            return result
            
        except Exception as e:
            logger.error(f"❌ Resize error: {e}")
            return image.resize(target_size, Image.Resampling.LANCZOS)
    
    def apply_hand_detection_preprocessing(self, image):
        """
        Apply preprocessing specifically for hand detection
        Args:
            image: PIL Image
        Returns:
            PIL Image: Preprocessed image
        """
        try:
            # Convert to RGB
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Convert to numpy for OpenCV operations
            img_array = np.array(image)
            
            # Apply Gaussian blur to reduce noise
            img_array = cv2.GaussianBlur(img_array, (3, 3), 0)
            
            # Enhance contrast using CLAHE
            lab = cv2.cvtColor(img_array, cv2.COLOR_RGB2LAB)
            l, a, b = cv2.split(lab)
            
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            
            enhanced = cv2.merge([l, a, b])
            img_array = cv2.cvtColor(enhanced, cv2.COLOR_LAB2RGB)
            
            # Convert back to PIL Image
            return Image.fromarray(img_array)
            
        except Exception as e:
            logger.warning(f"⚠️ Hand detection preprocessing failed: {e}")
            return image
    
    def normalize_hand_crop(self, hand_crop):
        """
        Normalize hand crop for consistent ASL classification
        Args:
            hand_crop: PIL Image of hand region
        Returns:
            PIL Image: Normalized hand crop
        """
        try:
            # Ensure square aspect ratio for ASL classification
            width, height = hand_crop.size
            size = max(width, height)
            
            # Create square image with black background
            square_image = Image.new('RGB', (size, size), color=(0, 0, 0))
            
            # Paste hand crop in center
            x_offset = (size - width) // 2
            y_offset = (size - height) // 2
            square_image.paste(hand_crop, (x_offset, y_offset))
            
            # Apply hand-specific enhancements
            enhanced = self.enhance_for_hand_recognition(square_image)
            
            return enhanced
            
        except Exception as e:
            logger.error(f"❌ Hand crop normalization error: {e}")
            return hand_crop
    
    def batch_preprocess_for_asl(self, images):
        """
        Preprocess a batch of images for ASL classification
        Args:
            images: List of PIL Images
        Returns:
            torch.Tensor: Batch tensor of preprocessed images
        """
        try:
            processed_tensors = []
            
            for image in images:
                tensor = self.preprocess_for_asl(image)
                processed_tensors.append(tensor)
            
            # Stack into batch
            batch_tensor = torch.stack(processed_tensors)
            
            return batch_tensor
            
        except Exception as e:
            logger.error(f"❌ Batch preprocessing error: {e}")
            raise
    
    def postprocess_detections(self, detections, original_size, input_size):
        """
        Convert detection coordinates from model input size to original image size
        Args:
            detections: List of detection dictionaries
            original_size: (width, height) of original image
            input_size: (width, height) of model input
        Returns:
            List of detection dictionaries with corrected coordinates
        """
        try:
            if not detections:
                return detections
            
            orig_w, orig_h = original_size
            input_w, input_h = input_size
            
            scale_x = orig_w / input_w
            scale_y = orig_h / input_h
            
            processed_detections = []
            
            for detection in detections:
                # Copy detection
                new_detection = detection.copy()
                
                # Scale bounding box coordinates
                if 'bbox' in detection:
                    x_min, y_min, x_max, y_max = detection['bbox']
                    
                    new_detection['bbox'] = [
                        x_min * scale_x,
                        y_min * scale_y,
                        x_max * scale_x,
                        y_max * scale_y
                    ]
                
                processed_detections.append(new_detection)
            
            return processed_detections
            
        except Exception as e:
            logger.error(f"❌ Detection postprocessing error: {e}")
            return detections
    
    def create_visualization_overlay(self, image, detections, predictions):
        """
        Create an overlay visualization of detections and predictions
        Args:
            image: PIL Image
            detections: Detection results
            predictions: ASL prediction results
        Returns:
            PIL Image: Image with overlay
        """
        try:
            overlay = image.copy()
            # This method can be extended to create more sophisticated visualizations
            return overlay
            
        except Exception as e:
            logger.error(f"❌ Visualization overlay error: {e}")
            return image
    
    def get_image_stats(self, image):
        """
        Get basic statistics about an image
        Args:
            image: PIL Image
        Returns:
            dict: Image statistics
        """
        try:
            width, height = image.size
            mode = image.mode
            
            # Convert to numpy for stats
            img_array = np.array(image)
            
            stats = {
                'width': width,
                'height': height,
                'mode': mode,
                'channels': len(img_array.shape) if len(img_array.shape) > 2 else 1,
                'mean_brightness': np.mean(img_array),
                'std_brightness': np.std(img_array),
                'min_value': np.min(img_array),
                'max_value': np.max(img_array)
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Image stats error: {e}")
            return {}

# Utility functions
def pil_to_cv2(pil_image):
    """Convert PIL Image to OpenCV format"""
    return cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)

def cv2_to_pil(cv2_image):
    """Convert OpenCV image to PIL format"""
    return Image.fromarray(cv2.cvtColor(cv2_image, cv2.COLOR_BGR2RGB))

def ensure_rgb(image):
    """Ensure image is in RGB format"""
    if isinstance(image, Image.Image):
        return image.convert('RGB') if image.mode != 'RGB' else image
    elif isinstance(image, np.ndarray):
        if len(image.shape) == 3 and image.shape[2] == 3:
            return image
        elif len(image.shape) == 3 and image.shape[2] == 4:
            return image[:, :, :3]  # Remove alpha channel
        else:
            return cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
    else:
        raise ValueError("Unsupported image format")

# Example usage and testing
if __name__ == "__main__":
    print("🧪 Testing Image Processor...")
    
    # Create processor
    processor = ImageProcessor()
    
    # Test with dummy image
    dummy_image = Image.fromarray(np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8))
    
    print("📊 Original image stats:")
    stats = processor.get_image_stats(dummy_image)
    for key, value in stats.items():
        print(f"   {key}: {value}")
    
    # Test ASL preprocessing
    print("\n🤟 Testing ASL preprocessing...")
    asl_tensor = processor.preprocess_for_asl(dummy_image)
    print(f"   ASL tensor shape: {asl_tensor.shape}")
    
    # Test YOLO preprocessing
    print("\n🎯 Testing YOLO preprocessing...")
    yolo_tensor, original_size = processor.preprocess_for_yolo(dummy_image)
    print(f"   YOLO tensor shape: {yolo_tensor.shape}")
    print(f"   Original size: {original_size}")
    
    # Test cropping
    print("\n✂️ Testing cropping...")
    bbox = [100, 100, 300, 300]
    cropped = processor.crop_with_padding(dummy_image, bbox, padding=20)
    print(f"   Cropped size: {cropped.size}")
    
    print("\n✅ Image processor tests completed!")