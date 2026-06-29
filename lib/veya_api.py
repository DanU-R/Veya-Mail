#!/usr/bin/env python3
"""Veya-Mail API client - Temp mail untuk MiMo registration"""
import httpx, json, time

API = "https://tempmail-worker.danuranggana9.workers.dev"
PASSWORD = "Bandulan123@"

class VeyaMail:
    def __init__(self):
        self.token = None
        self.address_id = None
        self.address = None
    
    def login(self):
        r = httpx.post(f"{API}/api/login", json={"password": PASSWORD}, timeout=10)
        self.token = r.json()["token"]
        return self.token
    
    def create_address(self, username=None, ttl=60):
        if not self.token: self.login()
        body = {"ttl_minutes": ttl}
        if username: body["username"] = username
        r = httpx.post(f"{API}/api/addresses", json=body,
            headers={"Authorization": f"Bearer {self.token}"}, timeout=10)
        if r.status_code == 201:
            data = r.json()
            self.address_id = data["id"]
            self.address = data["address"]
            return data
        raise Exception(f"Create failed: {r.text}")
    
    def get_messages(self, max_wait=180, interval=10):
        if not self.address_id: raise Exception("No address")
        start = time.time()
        while time.time() - start < max_wait:
            r = httpx.get(f"{API}/api/addresses/{self.address_id}/messages",
                headers={"Authorization": f"Bearer {self.token}"}, timeout=10)
            msgs = r.json().get("messages", [])
            if msgs:
                return msgs
            print(f"  Waiting for email... ({int(time.time()-start)}s)")
            time.sleep(interval)
        return []
    
    def get_message_detail(self, msg_id):
        r = httpx.get(f"{API}/api/messages/{msg_id}",
            headers={"Authorization": f"Bearer {self.token}"}, timeout=10)
        return r.json().get("message", {})
