from database import SessionLocal
import models
import datetime

def test_create_product():
    db = SessionLocal()
    # Find a user first
    user = db.query(models.User).first()
    if not user:
        print("No users found in DB to attach product to.")
        return
    
    print(f"Using user: {user.email} (ID: {user.id})")
    
    product_id = "TEST_QR_" + datetime.datetime.now().strftime("%H%M%S")
    try:
        new_product = models.Product(
            id=product_id,
            user_id=user.id,
            device_name="Debug Product",
            description="Testing column presence",
            name="Test Owner",
            mobile="1234567890",
            address="Test Address",
            is_lost=False,
            display_information=True
        )
        db.add(new_product)
        db.commit()
        print(f"Successfully created product: {product_id}")
        
        # Clean up
        db.delete(new_product)
        db.commit()
        print("Cleanup successful.")
    except Exception as e:
        print(f"FAILED to create product: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_create_product()
