from sqlalchemy.orm import Session
from database import engine
import models

def list_tags():
    with Session(engine) as db:
        print("--- PRODUCTS ---")
        products = db.query(models.Product).all()
        for p in products:
            print(f"ID: {p.id}, t_id: {p.t_id}, Assigned: {p.is_assigned}, Lost: {p.is_lost}")
        
        print("\n--- HEALTH PROFILES ---")
        health = db.query(models.HealthProfile).all()
        for h in health:
            print(f"ID: {h.id}, t_id: {h.t_id}, Assigned: {h.is_assigned}")

if __name__ == "__main__":
    list_tags()
