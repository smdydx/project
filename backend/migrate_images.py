
#!/usr/bin/env python3
"""
Script to check KYC images and help migrate them
"""
import os
from sqlalchemy.orm import Session
from core.database import SessionLocal, engine
from models.models import OfflineKYC, PanOfflineKYC
from core.config import settings

def check_kyc_images():
    """Check which KYC images are missing"""
    db = SessionLocal()
    
    # Create uploads directory if not exists
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    
    print(f"📁 Upload folder: {settings.UPLOAD_FOLDER}")
    print(f"📁 Checking existing files...\n")
    
    # List all files in upload folder
    if os.path.exists(settings.UPLOAD_FOLDER):
        existing_files = os.listdir(settings.UPLOAD_FOLDER)
        print(f"✅ Found {len(existing_files)} files in upload folder:")
        for f in existing_files:
            print(f"   - {f}")
    else:
        print("⚠️ Upload folder doesn't exist!")
        existing_files = []
    
    print("\n" + "="*60)
    print("Checking database records...\n")
    
    # Check Aadhaar images
    kyc_records = db.query(OfflineKYC).all()
    print(f"📋 Total KYC records: {len(kyc_records)}\n")
    
    missing_aadhaar_front = []
    missing_aadhaar_back = []
    
    for kyc in kyc_records:
        if kyc.aadhar_front_filename:
            file_path = os.path.join(settings.UPLOAD_FOLDER, kyc.aadhar_front_filename)
            if not os.path.exists(file_path):
                missing_aadhaar_front.append({
                    'user_id': kyc.user_id,
                    'filename': kyc.aadhar_front_filename
                })
                print(f"❌ Missing Aadhaar Front for User {kyc.user_id}: {kyc.aadhar_front_filename}")
        
        if kyc.aadhar_back_filename:
            file_path = os.path.join(settings.UPLOAD_FOLDER, kyc.aadhar_back_filename)
            if not os.path.exists(file_path):
                missing_aadhaar_back.append({
                    'user_id': kyc.user_id,
                    'filename': kyc.aadhar_back_filename
                })
                print(f"❌ Missing Aadhaar Back for User {kyc.user_id}: {kyc.aadhar_back_filename}")
    
    # Check PAN images
    pan_records = db.query(PanOfflineKYC).all()
    print(f"\n📋 Total PAN records: {len(pan_records)}\n")
    
    missing_pan = []
    
    for pan in pan_records:
        if pan.pan_front:
            file_path = os.path.join(settings.UPLOAD_FOLDER, pan.pan_front)
            if not os.path.exists(file_path):
                missing_pan.append({
                    'kyc_id': pan.offline_kyc_id,
                    'filename': pan.pan_front
                })
                print(f"❌ Missing PAN for KYC {pan.offline_kyc_id}: {pan.pan_front}")
    
    print("\n" + "="*60)
    print("SUMMARY:")
    print(f"❌ Missing Aadhaar Front images: {len(missing_aadhaar_front)}")
    print(f"❌ Missing Aadhaar Back images: {len(missing_aadhaar_back)}")
    print(f"❌ Missing PAN images: {len(missing_pan)}")
    print("\n💡 To fix: Upload missing images to '{settings.UPLOAD_FOLDER}' folder")
    
    db.close()

if __name__ == "__main__":
    check_kyc_images()
