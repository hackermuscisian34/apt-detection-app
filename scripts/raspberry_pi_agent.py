#!/usr/bin/env python3
"""
Raspberry Pi Agent for APT Detection System
This script runs on Raspberry Pi devices to monitor network traffic and report threats
"""

import requests
import time
import psutil
import socket
import json
from datetime import datetime

# Configuration
API_BASE_URL = "https://your-app-url.vercel.app/api"  # Replace with your actual URL
AGENT_NAME = "Pi-Gateway-01"  # Customize for each Pi
HEARTBEAT_INTERVAL = 30  # seconds
AGENT_ID = None  # Will be set after registration

def get_local_ip():
    """Get the local IP address of the Raspberry Pi"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def get_system_metrics():
    """Get CPU, memory, and disk usage"""
    return {
        "cpu_usage": psutil.cpu_percent(interval=1),
        "memory_usage": psutil.virtual_memory().percent,
        "disk_usage": psutil.disk_usage('/').percent
    }

def register_agent():
    """Register this agent with the central system"""
    global AGENT_ID
    
    ip_address = get_local_ip()
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/agents/register",
            json={
                "agent_name": AGENT_NAME,
                "ip_address": ip_address
            },
            timeout=10
        )
        
        if response.status_code == 201:
            data = response.json()
            AGENT_ID = data["agent"]["id"]
            print(f"Agent registered successfully. ID: {AGENT_ID}")
            return True
        elif response.status_code == 409:
            print("Agent already registered")
            # In production, you'd retrieve the agent ID here
            return False
        else:
            print(f"Registration failed: {response.text}")
            return False
    except Exception as e:
        print(f"Registration error: {e}")
        return False

def send_heartbeat():
    """Send heartbeat with system metrics"""
    if not AGENT_ID:
        return
    
    metrics = get_system_metrics()
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/agents/heartbeat",
            json={
                "agent_id": AGENT_ID,
                **metrics
            },
            timeout=10
        )
        
        if response.status_code == 200:
            print(f"Heartbeat sent - CPU: {metrics['cpu_usage']:.1f}% | "
                  f"Memory: {metrics['memory_usage']:.1f}% | "
                  f"Disk: {metrics['disk_usage']:.1f}%")
        else:
            print(f"Heartbeat failed: {response.text}")
    except Exception as e:
        print(f"Heartbeat error: {e}")

def report_threat(threat_type, severity, description, source_ip=None, 
                  destination_ip=None, port=None, protocol=None):
    """Report a detected threat to the central system"""
    if not AGENT_ID:
        return
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/threats/report",
            json={
                "agent_id": AGENT_ID,
                "threat_type": threat_type,
                "severity": severity,
                "description": description,
                "source_ip": source_ip,
                "destination_ip": destination_ip,
                "port": port,
                "protocol": protocol
            },
            timeout=10
        )
        
        if response.status_code == 201:
            print(f"Threat reported: {threat_type} ({severity})")
        else:
            print(f"Threat report failed: {response.text}")
    except Exception as e:
        print(f"Threat report error: {e}")

def send_log(log_level, message, metadata=None):
    """Send a log message to the central system"""
    if not AGENT_ID:
        return
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/logs",
            json={
                "agent_id": AGENT_ID,
                "log_level": log_level,
                "message": message,
                "metadata": metadata
            },
            timeout=10
        )
        
        if response.status_code != 201:
            print(f"Log send failed: {response.text}")
    except Exception as e:
        print(f"Log send error: {e}")

def monitor_network():
    """
    Monitor network traffic for threats
    This is a simplified example - in production, you'd use tools like:
    - Snort for intrusion detection
    - Suricata for network security monitoring
    - Custom packet analysis with scapy
    """
    # Example: Detect high CPU usage as a potential threat
    metrics = get_system_metrics()
    
    if metrics["cpu_usage"] > 90:
        report_threat(
            threat_type="Resource Exhaustion",
            severity="medium",
            description=f"High CPU usage detected: {metrics['cpu_usage']:.1f}%",
            source_ip=get_local_ip()
        )
    
    if metrics["memory_usage"] > 90:
        report_threat(
            threat_type="Resource Exhaustion",
            severity="medium",
            description=f"High memory usage detected: {metrics['memory_usage']:.1f}%",
            source_ip=get_local_ip()
        )

def main():
    """Main agent loop"""
    print(f"Starting APT Detection Agent: {AGENT_NAME}")
    
    # Register agent
    if not register_agent():
        print("Failed to register agent. Exiting.")
        return
    
    send_log("info", f"Agent {AGENT_NAME} started successfully")
    
    last_heartbeat = time.time()
    
    try:
        while True:
            # Send heartbeat
            if time.time() - last_heartbeat >= HEARTBEAT_INTERVAL:
                send_heartbeat()
                last_heartbeat = time.time()
            
            # Monitor for threats
            monitor_network()
            
            # Sleep for a bit
            time.sleep(5)
            
    except KeyboardInterrupt:
        print("\nShutting down agent...")
        send_log("info", f"Agent {AGENT_NAME} shutting down")
    except Exception as e:
        print(f"Error in main loop: {e}")
        send_log("error", f"Agent error: {str(e)}")

if __name__ == "__main__":
    main()
