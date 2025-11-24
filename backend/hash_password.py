#!/usr/bin/env python3
import bcrypt
import sys
import getpass

def generate_password_hash(password):
    salt_rounds = 10
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=salt_rounds)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')

def verify_password_hash(password, hash_value):
    password_bytes = password.encode('utf-8')
    hash_bytes = hash_value.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

def main():
    if len(sys.argv) > 2 and sys.argv[1] == "--verify":
        password = sys.argv[2] if len(sys.argv) > 2 else None
        hash_value = sys.argv[3] if len(sys.argv) > 3 else None
        
        if not password or not hash_value:
            print("❌ Sử dụng: python hash_password.py --verify <password> <hash>")
            sys.exit(1)
        
        is_valid = verify_password_hash(password, hash_value)
        if is_valid:
            print("✅ Hash khớp với mật khẩu!")
        else:
            print("❌ Hash KHÔNG khớp với mật khẩu!")
        sys.exit(0)
    
    password = None
    
    if len(sys.argv) > 1:
        password = sys.argv[1]
    else:
        password = getpass.getpass("Nhập mật khẩu cần hash: ")
    
    if not password or password.strip() == "":
        print("❌ Mật khẩu không được để trống!")
        sys.exit(1)
    
    print("\n⏳ Đang hash mật khẩu...")
    hash_result = generate_password_hash(password)
    
    print("\n✅ Mật khẩu đã được hash:")
    print("─" * 80)
    print(hash_result)
    print("─" * 80)
    
    print("\n🧪 Đang kiểm tra hash...")
    if verify_password_hash(password, hash_result):
        print("✅ Hash đã được verify thành công!")
    else:
        print("❌ Lỗi: Hash không khớp!")
    
    print("\n📋 Copy hash trên để sử dụng trong database.")
    print("💡 Tip: Đảm bảo copy toàn bộ hash, không có khoảng trắng thừa.")

if __name__ == "__main__":
    main()

