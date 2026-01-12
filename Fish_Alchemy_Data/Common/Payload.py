from dataclasses import dataclass
import requests

@dataclass
class Payload():
    username: str
    title: str
    description: str
    color: int

    def to_json(self) -> dict:
        payjson = {
            "username": self.username,
            "embeds": [
                {
                    "title": self.title,
                    "description": self.description,
                    "color": self.color,
                }
            ]
        }
        return payjson
    
def send_discord_message(webhook: str, payload: dict) -> None:
    r = requests.post(webhook, json=payload)
    r.raise_for_status()