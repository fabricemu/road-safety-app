#!/usr/bin/env python3
"""
Test script for analytics endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_analytics_endpoints():
    """Test the analytics endpoints"""
    
    # First, let's try to get the dashboard stats without authentication
    print("Testing analytics endpoints...")
    
    try:
        # Test health endpoint first
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        
        # Test analytics endpoints (should return 401 without auth)
        endpoints = [
            "/api/analytics/dashboard-stats",
            "/api/analytics/user-analytics",
            "/api/analytics/course-analytics", 
            "/api/analytics/quiz-analytics",
            "/api/analytics/user-count"
        ]
        
        for endpoint in endpoints:
            response = requests.get(f"{BASE_URL}{endpoint}")
            print(f"{endpoint}: {response.status_code}")
            if response.status_code == 401:
                print("  ✓ Properly requires authentication")
            elif response.status_code == 200:
                print("  ⚠️  Should require authentication but doesn't")
            else:
                print(f"  ❌ Unexpected status: {response.text[:100]}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to server. Make sure the backend is running on port 8000")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    test_analytics_endpoints() 