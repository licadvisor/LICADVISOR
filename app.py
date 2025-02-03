from flask import Flask, request, jsonify
from flask_mail import Mail, Message
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import bcrypt
import jwt
import secrets
import os
from dotenv import load_dotenv
from flask_cors import CORS
from routes import customers

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lic_advisor.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Email configuration
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('EMAIL_USER')
app.config['MAIL_PASSWORD'] = os.getenv('EMAIL_PASSWORD')

# Initialize extensions
db = SQLAlchemy(app)
mail = Mail(app)

# Models
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    failed_attempts = db.Column(db.Integer, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expiry = db.Column(db.DateTime, nullable=True)
    last_login = db.Column(db.DateTime, nullable=True)

# Register blueprints
app.register_blueprint(customers)

# Create tables
with app.app_context():
    db.create_all()
    # Create default admin if not exists
    if not Admin.query.filter_by(admin_id='admin').first():
        default_admin = Admin(
            admin_id='admin',
            password_hash=bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()),
            email='admin@licadvisor.com'
        )
        db.session.add(default_admin)
        db.session.commit()

def send_reset_email(email, reset_token):
    msg = Message('Password Reset Request',
                  sender='noreply@licadvisor.com',
                  recipients=[email])
    
    reset_url = f"http://localhost:5000/reset-password?token={reset_token}"
    
    msg.body = f'''To reset your password, visit the following link:
{reset_url}

If you did not make this request then simply ignore this email and no changes will be made.

This link will expire in 30 minutes.
'''
    mail.send(msg)

@app.route('/api/admin/login', methods=['POST'])
def login():
    data = request.get_json()
    admin_id = data.get('adminId')
    password = data.get('password')
    
    admin = Admin.query.filter_by(admin_id=admin_id).first()
    
    if not admin:
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Check if account is locked
    if admin.locked_until and admin.locked_until > datetime.utcnow():
        remaining_time = (admin.locked_until - datetime.utcnow()).total_seconds() / 60
        return jsonify({
            'error': f'Account is locked. Try again in {int(remaining_time)} minutes.'
        }), 403
    
    # Verify password
    if not bcrypt.checkpw(password.encode('utf-8'), admin.password_hash):
        admin.failed_attempts += 1
        
        # Lock account after 3 failed attempts
        if admin.failed_attempts >= 3:
            admin.locked_until = datetime.utcnow() + timedelta(minutes=30)
            db.session.commit()
            return jsonify({
                'error': 'Account locked for 30 minutes due to multiple failed attempts.'
            }), 403
        
        db.session.commit()
        remaining_attempts = 3 - admin.failed_attempts
        return jsonify({
            'error': f'Invalid credentials. {remaining_attempts} attempts remaining.'
        }), 401
    
    # Successful login
    admin.failed_attempts = 0
    admin.locked_until = None
    admin.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate token
    token = jwt.encode(
        {
            'admin_id': admin.admin_id,
            'exp': datetime.utcnow() + timedelta(hours=24)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    
    return jsonify({
        'token': token,
        'admin': {
            'id': admin.admin_id,
            'email': admin.email,
            'lastLogin': admin.last_login.isoformat() if admin.last_login else None
        }
    })

@app.route('/api/admin/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    admin_id = data.get('adminId')
    email = data.get('email')
    
    admin = Admin.query.filter_by(admin_id=admin_id, email=email).first()
    
    if not admin:
        return jsonify({'error': 'Invalid admin ID or email'}), 404
    
    # Generate reset token
    reset_token = secrets.token_urlsafe(32)
    admin.reset_token = reset_token
    admin.reset_token_expiry = datetime.utcnow() + timedelta(minutes=30)
    db.session.commit()
    
    # Send reset email
    try:
        send_reset_email(admin.email, reset_token)
        return jsonify({'message': 'Password reset email sent successfully'})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({'error': 'Error sending reset email'}), 500

@app.route('/api/admin/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json()
    token = data.get('token')
    new_password = data.get('newPassword')
    
    admin = Admin.query.filter_by(reset_token=token).first()
    
    if not admin or not admin.reset_token_expiry or admin.reset_token_expiry < datetime.utcnow():
        return jsonify({'error': 'Invalid or expired reset token'}), 400
    
    # Update password
    admin.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    admin.reset_token = None
    admin.reset_token_expiry = None
    admin.failed_attempts = 0
    admin.locked_until = None
    db.session.commit()
    
    return jsonify({'message': 'Password reset successful'})

@app.route('/api/admin/change-password', methods=['POST'])
def change_password():
    data = request.get_json()
    admin_id = data.get('adminId')
    current_password = data.get('currentPassword')
    new_password = data.get('newPassword')
    
    admin = Admin.query.filter_by(admin_id=admin_id).first()
    
    if not admin:
        return jsonify({'error': 'Admin not found'}), 404
    
    # Verify current password
    if not bcrypt.checkpw(current_password.encode('utf-8'), admin.password_hash):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    # Update password
    admin.password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'})

if __name__ == '__main__':
    app.run(debug=True)
