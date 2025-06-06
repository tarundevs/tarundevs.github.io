# utils/model_manager.py - Model Management Utilities for ASL Server
import torch
import torch.nn as nn
import os
import logging
from pathlib import Path
import time
from datetime import datetime
import json
import hashlib

logger = logging.getLogger(__name__)

class ModelManager:
    """Manages model loading, saving, and metadata for ASL server"""
    
    def __init__(self, device='cpu', weights_dir='weights'):
        self.device = torch.device(device)
        self.weights_dir = Path(weights_dir)
        self.weights_dir.mkdir(exist_ok=True)
        
        # Model registry to track loaded models
        self.model_registry = {}
        
        # Model metadata
        self.model_metadata = {}
        
        logger.info(f"🎯 Model Manager initialized on {self.device}")
        logger.info(f"📁 Weights directory: {self.weights_dir}")
    
    def load_model_weights(self, model, weights_path, strict=True):
        """
        Load model weights from file
        Args:
            model: PyTorch model instance
            weights_path: Path to weights file
            strict: Whether to strictly enforce state dict keys
        Returns:
            bool: Success status
        """
        try:
            weights_path = Path(weights_path)
            
            if not weights_path.exists():
                logger.warning(f"⚠️ Weights file not found: {weights_path}")
                logger.warning("🔄 Model will use randomly initialized weights")
                return False
            
            logger.info(f"📥 Loading weights from: {weights_path}")
            
            # Load checkpoint
            checkpoint = torch.load(weights_path, map_location=self.device)
            
            # Handle different checkpoint formats
            state_dict = self._extract_state_dict(checkpoint)
            
            # Load state dict
            missing_keys, unexpected_keys = model.load_state_dict(state_dict, strict=strict)
            
            if missing_keys:
                logger.warning(f"⚠️ Missing keys in state dict: {missing_keys}")
            if unexpected_keys:
                logger.warning(f"⚠️ Unexpected keys in state dict: {unexpected_keys}")
            
            # Set model to evaluation mode
            model.eval()
            
            # Store model info
            model_name = model.__class__.__name__
            self.model_registry[model_name] = {
                'model': model,
                'weights_path': str(weights_path),
                'loaded_at': datetime.now().isoformat(),
                'device': str(self.device)
            }
            
            # Load or create metadata
            self._load_model_metadata(weights_path)
            
            logger.info(f"✅ Successfully loaded weights for {model_name}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to load weights: {e}")
            return False
    
    def _extract_state_dict(self, checkpoint):
        """Extract state dict from checkpoint (handles different formats)"""
        if isinstance(checkpoint, dict):
            # Try common keys
            for key in ['model_state_dict', 'state_dict', 'model']:
                if key in checkpoint:
                    return checkpoint[key]
            
            # If no common keys, assume the dict itself is the state dict
            return checkpoint
        else:
            # Assume it's directly a state dict
            return checkpoint
    
    def save_model_weights(self, model, weights_path, metadata=None):
        """
        Save model weights to file
        Args:
            model: PyTorch model instance
            weights_path: Path to save weights
            metadata: Optional metadata dict
        Returns:
            bool: Success status
        """
        try:
            weights_path = Path(weights_path)
            weights_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Create checkpoint
            checkpoint = {
                'model_state_dict': model.state_dict(),
                'model_class': model.__class__.__name__,
                'saved_at': datetime.now().isoformat(),
                'device': str(self.device)
            }
            
            # Add metadata if provided
            if metadata:
                checkpoint['metadata'] = metadata
            
            # Save checkpoint
            torch.save(checkpoint, weights_path)
            
            # Save metadata separately
            self._save_model_metadata(weights_path, checkpoint)
            
            logger.info(f"✅ Model weights saved to: {weights_path}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to save weights: {e}")
            return False
    
    def _load_model_metadata(self, weights_path):
        """Load model metadata from JSON file"""
        try:
            metadata_path = weights_path.with_suffix('.json')
            
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
                
                self.model_metadata[str(weights_path)] = metadata
                logger.info(f"📊 Loaded metadata for {weights_path.name}")
            else:
                # Create basic metadata
                metadata = {
                    'file_name': weights_path.name,
                    'file_size': weights_path.stat().st_size,
                    'created_at': datetime.now().isoformat(),
                    'checksum': self._calculate_file_checksum(weights_path)
                }
                self.model_metadata[str(weights_path)] = metadata
                
        except Exception as e:
            logger.warning(f"⚠️ Failed to load metadata: {e}")
    
    def _save_model_metadata(self, weights_path, checkpoint):
        """Save model metadata to JSON file"""
        try:
            metadata_path = weights_path.with_suffix('.json')
            
            metadata = {
                'file_name': weights_path.name,
                'file_size': weights_path.stat().st_size,
                'model_class': checkpoint.get('model_class', 'Unknown'),
                'saved_at': checkpoint.get('saved_at'),
                'device': checkpoint.get('device'),
                'checksum': self._calculate_file_checksum(weights_path)
            }
            
            # Add custom metadata if present
            if 'metadata' in checkpoint:
                metadata.update(checkpoint['metadata'])
            
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            self.model_metadata[str(weights_path)] = metadata
            
        except Exception as e:
            logger.warning(f"⚠️ Failed to save metadata: {e}")
    
    def _calculate_file_checksum(self, file_path):
        """Calculate MD5 checksum of file"""
        try:
            hash_md5 = hashlib.md5()
            with open(file_path, "rb") as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_md5.update(chunk)
            return hash_md5.hexdigest()
        except Exception as e:
            logger.warning(f"⚠️ Failed to calculate checksum: {e}")
            return None
    
    def get_model_info(self, model_name):
        """Get information about a loaded model"""
        if model_name in self.model_registry:
            return self.model_registry[model_name]
        else:
            logger.warning(f"⚠️ Model {model_name} not found in registry")
            return None
    
    def get_model_metadata(self, weights_path):
        """Get metadata for a weights file"""
        weights_path = str(Path(weights_path))
        return self.model_metadata.get(weights_path, {})
    
    def list_available_weights(self):
        """List all available weight files in the weights directory"""
        weight_files = []
        
        for file_path in self.weights_dir.glob('*.pth'):
            try:
                file_info = {
                    'name': file_path.name,
                    'path': str(file_path),
                    'size': file_path.stat().st_size,
                    'modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
                    'metadata': self.get_model_metadata(file_path)
                }
                weight_files.append(file_info)
            except Exception as e:
                logger.warning(f"⚠️ Error reading {file_path}: {e}")
        
        return weight_files
    
    def validate_model_weights(self, model, weights_path):
        """
        Validate that weights file is compatible with model
        Args:
            model: PyTorch model instance
            weights_path: Path to weights file
        Returns:
            dict: Validation results
        """
        try:
            weights_path = Path(weights_path)
            
            if not weights_path.exists():
                return {
                    'valid': False,
                    'error': 'Weights file does not exist'
                }
            
            # Load checkpoint
            checkpoint = torch.load(weights_path, map_location='cpu')
            state_dict = self._extract_state_dict(checkpoint)
            
            # Get model state dict
            model_state_dict = model.state_dict()
            
            # Compare keys
            model_keys = set(model_state_dict.keys())
            weights_keys = set(state_dict.keys())
            
            missing_keys = model_keys - weights_keys
            extra_keys = weights_keys - model_keys
            
            # Check shapes
            shape_mismatches = []
            for key in model_keys & weights_keys:
                if model_state_dict[key].shape != state_dict[key].shape:
                    shape_mismatches.append({
                        'key': key,
                        'model_shape': list(model_state_dict[key].shape),
                        'weights_shape': list(state_dict[key].shape)
                    })
            
            validation_result = {
                'valid': len(missing_keys) == 0 and len(shape_mismatches) == 0,
                'missing_keys': list(missing_keys),
                'extra_keys': list(extra_keys),
                'shape_mismatches': shape_mismatches,
                'total_parameters': sum(p.numel() for p in model.parameters()),
                'weights_file_size': weights_path.stat().st_size
            }
            
            return validation_result
            
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            }
    
    def optimize_model_for_inference(self, model):
        """
        Optimize model for inference (e.g., convert to TorchScript)
        Args:
            model: PyTorch model
        Returns:
            Optimized model
        """
        try:
            # Set to evaluation mode
            model.eval()
            
            # Disable gradient computation
            for param in model.parameters():
                param.requires_grad = False
            
            # You can add TorchScript compilation here if needed
            # scripted_model = torch.jit.script(model)
            # return scripted_model
            
            logger.info("🚀 Model optimized for inference")
            return model
            
        except Exception as e:
            logger.warning(f"⚠️ Model optimization failed: {e}")
            return model
    
    def get_model_summary(self, model):
        """Get summary of model architecture"""
        try:
            total_params = sum(p.numel() for p in model.parameters())
            trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
            
            summary = {
                'model_class': model.__class__.__name__,
                'total_parameters': total_params,
                'trainable_parameters': trainable_params,
                'non_trainable_parameters': total_params - trainable_params,
                'model_size_mb': total_params * 4 / (1024 * 1024),  # Approximate size in MB
                'device': str(next(model.parameters()).device),
                'mode': 'training' if model.training else 'evaluation'
            }
            
            return summary
            
        except Exception as e:
            logger.error(f"❌ Error getting model summary: {e}")
            return {}
    
    def cleanup_old_weights(self, keep_recent=5):
        """
        Clean up old weight files, keeping only the most recent ones
        Args:
            keep_recent: Number of recent files to keep
        """
        try:
            weight_files = list(self.weights_dir.glob('*.pth'))
            
            if len(weight_files) <= keep_recent:
                return
            
            # Sort by modification time
            weight_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
            
            # Delete old files
            for file_path in weight_files[keep_recent:]:
                try:
                    file_path.unlink()
                    
                    # Also delete metadata file if it exists
                    metadata_path = file_path.with_suffix('.json')
                    if metadata_path.exists():
                        metadata_path.unlink()
                    
                    logger.info(f"🗑️ Deleted old weights: {file_path.name}")
                    
                except Exception as e:
                    logger.warning(f"⚠️ Failed to delete {file_path}: {e}")
            
        except Exception as e:
            logger.error(f"❌ Cleanup failed: {e}")
    
    def create_model_backup(self, model, backup_name=None):
        """
        Create a backup of the current model
        Args:
            model: PyTorch model
            backup_name: Optional backup name
        Returns:
            Path to backup file
        """
        try:
            if backup_name is None:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                backup_name = f"{model.__class__.__name__}_backup_{timestamp}.pth"
            
            backup_path = self.weights_dir / backup_name
            
            success = self.save_model_weights(
                model, 
                backup_path, 
                metadata={'backup_created': datetime.now().isoformat()}
            )
            
            if success:
                logger.info(f"💾 Model backup created: {backup_path}")
                return backup_path
            else:
                return None
                
        except Exception as e:
            logger.error(f"❌ Backup creation failed: {e}")
            return None

# Utility functions
def count_parameters(model):
    """Count total and trainable parameters in a model"""
    total = sum(p.numel() for p in model.parameters())
    trainable = sum(p.numel() for p in model.parameters() if p.requires_grad)
    return total, trainable

def get_model_device(model):
    """Get the device of a model"""
    return next(model.parameters()).device

def move_model_to_device(model, device):
    """Move model to specified device"""
    try:
        model.to(device)
        logger.info(f"📱 Model moved to {device}")
        return True
    except Exception as e:
        logger.error(f"❌ Failed to move model to {device}: {e}")
        return False

# Example usage and testing
if __name__ == "__main__":
    print("🧪 Testing Model Manager...")
    
    # Setup logging for testing
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Create a simple test model
    class TestModel(nn.Module):
        def __init__(self):
            super().__init__()
            self.conv1 = nn.Conv2d(3, 16, kernel_size=3, padding=1)
            self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
            self.fc = nn.Linear(32 * 8 * 8, 10)
            self.relu = nn.ReLU()
            self.pool = nn.MaxPool2d(2, 2)
            
        def forward(self, x):
            x = self.pool(self.relu(self.conv1(x)))
            x = self.pool(self.relu(self.conv2(x)))
            x = x.view(x.size(0), -1)
            x = self.fc(x)
            return x
    
    # Initialize ModelManager
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    manager = ModelManager(device=device, weights_dir='test_weights')
    
    # Create test model
    model = TestModel()
    print(f"📋 Created test model: {model.__class__.__name__}")
    
    # Test model summary
    print("\n📊 Model Summary:")
    summary = manager.get_model_summary(model)
    for key, value in summary.items():
        print(f"  {key}: {value}")
    
    # Test parameter counting
    total_params, trainable_params = count_parameters(model)
    print(f"\n🔢 Parameters: {total_params:,} total, {trainable_params:,} trainable")
    
    # Test saving model weights
    print("\n💾 Testing model saving...")
    test_weights_path = "test_weights/test_model.pth"
    success = manager.save_model_weights(
        model, 
        test_weights_path,
        metadata={
            'test_mode': True,
            'created_by': 'test_script',
            'model_version': '1.0'
        }
    )
    
    if success:
        print("✅ Model saved successfully")
    else:
        print("❌ Model save failed")
    
    # Test loading model weights
    print("\n📥 Testing model loading...")
    new_model = TestModel()
    success = manager.load_model_weights(new_model, test_weights_path)
    
    if success:
        print("✅ Model loaded successfully")
        
        # Test model info retrieval
        model_info = manager.get_model_info("TestModel")
        if model_info:
            print(f"📋 Model info: {model_info}")
    else:
        print("❌ Model load failed")
    
    # Test weights validation
    print("\n🔍 Testing weights validation...")
    validation_result = manager.validate_model_weights(model, test_weights_path)
    print(f"Validation result: {validation_result}")
    
    # Test listing available weights
    print("\n📂 Available weights:")
    available_weights = manager.list_available_weights()
    for weight_info in available_weights:
        print(f"  - {weight_info['name']} ({weight_info['size']} bytes)")
    
    # Test model optimization
    print("\n🚀 Testing model optimization...")
    optimized_model = manager.optimize_model_for_inference(model)
    print(f"Model training mode: {optimized_model.training}")
    
    # Test backup creation
    print("\n💾 Testing backup creation...")
    backup_path = manager.create_model_backup(model)
    if backup_path:
        print(f"✅ Backup created: {backup_path}")
    
    # Test metadata retrieval
    print("\n📊 Testing metadata retrieval...")
    metadata = manager.get_model_metadata(test_weights_path)
    print(f"Metadata: {metadata}")
    
    # Test device movement
    print(f"\n📱 Testing device movement...")
    current_device = get_model_device(model)
    print(f"Current device: {current_device}")
    
    # Try moving to CPU (safe for all systems)
    success = move_model_to_device(model, 'cpu')
    if success:
        new_device = get_model_device(model)
        print(f"New device: {new_device}")
    
    # Test cleanup (with high keep_recent to avoid deleting our test file)
    print("\n🧹 Testing cleanup...")
    manager.cleanup_old_weights(keep_recent=10)
    
    print("\n✅ All tests completed!")
    print("🎉 ModelManager is ready for use in your ASL server!")
    
    # Usage example for ASL server
    print("\n" + "="*50)
    print("📚 USAGE EXAMPLE FOR ASL SERVER:")
    print("="*50)
    print("""
# In your ASL server code:
from utils.model_manager import ModelManager

# Initialize manager
model_manager = ModelManager(
    device='cuda' if torch.cuda.is_available() else 'cpu',
    weights_dir='models/weights'
)

# Load your ASL model
asl_model = YourASLModel()  # Your actual ASL model class
success = model_manager.load_model_weights(
    asl_model, 
    'models/weights/asl_model_best.pth'
)

if success:
    # Optimize for inference
    asl_model = model_manager.optimize_model_for_inference(asl_model)
    
    # Get model info
    summary = model_manager.get_model_summary(asl_model)
    print(f"ASL Model loaded: {summary['total_parameters']:,} parameters")
    
    # Use model for predictions...
else:
    print("Failed to load ASL model weights")
    """)