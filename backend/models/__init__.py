# app/models/__init__.py
import importlib, pkgutil

# Auto-import all submodules and subpackages under app.models
for _, module_name, _ in pkgutil.walk_packages(__path__, prefix=__name__ + "."):
    # skip private/dunder modules
    if module_name.rsplit(".", 1)[-1].startswith("_"):
        continue
    importlib.import_module(module_name)