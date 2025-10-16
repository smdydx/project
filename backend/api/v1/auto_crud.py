"""Auto-generated CRUD endpoints for all models"""
from fastapi import APIRouter
from core.crud_generator import CRUDGenerator
from core.base import Base
from typing import List, Tuple, Type
import re

def auto_discover_models() -> List[Tuple[Type, str, str]]:
    """Auto-discover all SQLAlchemy models from Base registry"""
    models = []
    
    for mapper in Base.registry.mappers:
        model_class = mapper.class_
        table_name = mapper.class_.__tablename__
        
        # Generate display name from table name
        display_name = table_name.replace("_", " ").title()
        
        # Generate URL-friendly endpoint
        endpoint = f"/{table_name.replace('_', '-')}"
        
        models.append((model_class, display_name, endpoint))
    
    # Sort by display name for better organization
    models.sort(key=lambda x: x[1])
    
    return models

# Auto-discover all models
MODEL_REGISTRY = auto_discover_models()

def create_auto_crud_routers():
    """Create CRUD routers for all models"""
    routers = []
    
    for model, name, prefix in MODEL_REGISTRY:
        router = CRUDGenerator.create_router(
            model=model,
            name=name,
            prefix=prefix,
            tags=["Auto CRUD"]
        )
        routers.append((router, name, prefix))
    
    return routers

def get_models_list():
    """Get list of all models with their endpoints"""
    return [
        {
            "name": name,
            "endpoint": f"/api/crud{prefix}",
            "tableName": model.__tablename__
        }
        for model, name, prefix in MODEL_REGISTRY
    ]
