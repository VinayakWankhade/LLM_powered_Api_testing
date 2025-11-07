"""
Script to check all module imports and identify broken connections
"""
import sys
import importlib
from pathlib import Path

def check_module_imports():
    """Check if all modules can be imported successfully"""
    errors = []
    warnings = []
    
    modules_to_check = [
        # Core modules
        'app.core.config',
        'app.core.analysis',
        'app.core.coverage_aggregator',
        'app.core.execution_engine',
        'app.core.feedback_loop',
        'app.core.orchestrator',
        'app.core.policy_manager',
        'app.core.recommendation',
        'app.core.rl_optimizer',
        'app.core.test_prioritization_scheduler',
        'app.core.websocket_manager',
        'app.core.workflow_orchestrator',
        
        # Routers
        'app.routers.ingest',
        'app.routers.execution',
        'app.routers.analytics',
        'app.routers.generation',
        'app.routers.healing',
        'app.routers.dashboard',
        'app.routers.real_time_testing',
        'app.routers.feedback',
        'app.routers.workflow',
        'app.routers.reports',
        
        # Main app
        'app.main',
    ]
    
    print("Checking module imports...\n")
    
    for module_name in modules_to_check:
        try:
            importlib.import_module(module_name)
            print(f"✓ {module_name}")
        except ImportError as e:
            error_msg = f"✗ {module_name}: {str(e)}"
            errors.append(error_msg)
            print(error_msg)
        except Exception as e:
            warning_msg = f"⚠ {module_name}: {str(e)}"
            warnings.append(warning_msg)
            print(warning_msg)
    
    print("\n" + "="*80)
    print(f"\nSummary:")
    print(f"  Modules checked: {len(modules_to_check)}")
    print(f"  Import errors: {len(errors)}")
    print(f"  Warnings: {len(warnings)}")
    
    if errors:
        print("\n❌ Import Errors Found:")
        for error in errors:
            print(f"  {error}")
    
    if warnings:
        print("\n⚠️  Warnings:")
        for warning in warnings:
            print(f"  {warning}")
    
    if not errors and not warnings:
        print("\n✅ All modules imported successfully!")
    
    return len(errors) == 0

if __name__ == "__main__":
    success = check_module_imports()
    sys.exit(0 if success else 1)
