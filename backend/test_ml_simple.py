#!/usr/bin/env python3
"""
Simple test script to verify ML service JSON output
"""

import json
import sys

def main():
    # Simple test response
    test_response = {
        "success": True,
        "message": "ML Service Test",
        "data": {
            "test": "working"
        }
    }
    
    # Output only JSON to stdout
    print(json.dumps(test_response))
    sys.exit(0)

if __name__ == "__main__":
    main()
