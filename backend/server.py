#!/usr/bin/env python
"""Direct Uvicorn runner for development."""
import uvicorn
import sys
import os

# Ensure we're in the backend directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
