from sqlalchemy.orm import Session
from database import engine
import models

def mark_lost(tag_id, lost=True):
    with Session(engine) as db:
        product = db.query(models.Product).filter(
            (models.Product.id == tag_id) | (models.Product.t_id == tag_id)
        ).first()
        if product:
            product.is_lost = lost
            db.commit()
            print(f"Tag {tag_id} is_lost set to {lost}")
        else:
            print(f"Tag {tag_id} not found")

if __name__ == "__main__":
    import sys
    tag_id = sys.argv[1] if len(sys.argv) > 1 else "2000829"
    lost = sys.argv[2].lower() != "false" if len(sys.argv) > 2 else True
    mark_lost(tag_id, lost)
