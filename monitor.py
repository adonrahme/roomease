import json
import time
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, List, Set
import os
from datetime import datetime

class DBMonitor:
    def __init__(self, db_path: str, check_interval: int = 60):
        self.db_path = db_path
        self.check_interval = check_interval
        self.previous_state = self.read_current_state()
        
        self.smtp_server = "smtp.gmail.com" 
        self.smtp_port = 587
        self.sender_email = "arahme@scu.edu"
        self.sender_password = ""
        
    def read_current_state(self) -> dict:
        """Read the current state of the database file."""
        try:
            with open(self.db_path, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"roomies": [], "groceries": [], "tasks": [], "events": []}
            
    def get_email_by_username(self, username: str) -> str:
        """Get email address for a given username."""
        for roomie in self.previous_state["roomies"]:
            if roomie["user"] == username:
                return roomie["email"]
        return None
        
    def find_new_items(self, current_state: dict) -> Dict[str, List[dict]]:
        """Find new items by comparing current state with previous state."""
        new_items = {
            "groceries": [],
            "tasks": [],
            "events": []
        }
        
        # Check each category
        for category in new_items.keys():
            current_ids = {item["id"] for item in current_state[category]}
            previous_ids = {item["id"] for item in self.previous_state[category]}
            new_ids = current_ids - previous_ids
            
            # Get the new items
            new_items[category] = [
                item for item in current_state[category]
                if item["id"] in new_ids
            ]
            
        return new_items
        
    def send_email(self, to_email: str, subject: str, body: str):
        """Send email notification."""
        msg = MIMEMultipart()
        msg['From'] = self.sender_email
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(body, 'plain'))
        
        try:
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            server.login(self.sender_email, self.sender_password)
            server.send_message(msg)
            server.quit()
            print(f"Email sent successfully to {to_email}")
        except Exception as e:
            print(f"Failed to send email to {to_email}: {str(e)}")
            
    def format_notification(self, category: str, item: dict) -> str:
        """Format notification message based on item type."""
        if category == "groceries":
            return (f"New grocery item added:\n"
                   f"Item: {item['name']}\n"
                   f"Quantity: {item['quantity']} {item['unit']}\n"
                   f"Status: {item['status']}")
                   
        elif category == "tasks":
            return (f"New task added:\n"
                   f"Task: {item['name']}\n"
                   f"Due Date: {item['dueDate']}\n"
                   f"Status: {item['status']}")
                   
        elif category == "events":
            return (f"New event added:\n"
                   f"Event: {item['title']}\n"
                   f"Date: {item['date']}\n"
                   f"Status: {item['status']}")
                   
    def notify_roomies(self, category: str, item: dict):
        """Notify all roomies involved in a new item."""
        for username in item['roomies']:
            email = self.get_email_by_username(username)
            if email:
                subject = f"New {category[:-1]} added - RoomEase Notification"
                body = self.format_notification(category, item)
                self.send_email(email, subject, body)
                
    def monitor(self):
        """Main monitoring loop."""
        print(f"Starting to monitor {self.db_path}")
        while True:
            try:
                current_state = self.read_current_state()
                new_items = self.find_new_items(current_state)
                
                # Process new items and send notifications
                for category, items in new_items.items():
                    for item in items:
                        self.notify_roomies(category, item)
                
                # Update previous state
                self.previous_state = current_state
                
                # Wait before next check
                time.sleep(self.check_interval)
                
            except Exception as e:
                print(f"Error occurred: {str(e)}")
                time.sleep(self.check_interval)

if __name__ == "__main__":
    monitor = DBMonitor("db.json")
    monitor.monitor()
