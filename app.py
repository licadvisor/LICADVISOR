from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///lic_advisor.db'
app.config['UPLOAD_FOLDER'] = 'uploads'

db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# Models
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)
    policies = db.relationship('Policy', backref='owner', lazy=True)

class Policy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    policy_number = db.Column(db.String(50), unique=True, nullable=False)
    policy_type = db.Column(db.String(50), nullable=False)
    start_date = db.Column(db.DateTime, nullable=False)
    premium_amount = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    documents = db.relationship('Document', backref='policy', lazy=True)

class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(200), nullable=False)
    upload_date = db.Column(db.DateTime, default=datetime.utcnow)
    document_type = db.Column(db.String(50), nullable=False)
    policy_id = db.Column(db.Integer, db.ForeignKey('policy.id'), nullable=False)

class PolicyCategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    policies = db.relationship('InsurancePolicy', backref='category', lazy=True)

class InsurancePolicy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    policy_number = db.Column(db.String(50), unique=True)
    category_id = db.Column(db.Integer, db.ForeignKey('policy_category.id'), nullable=False)
    min_age = db.Column(db.Integer)
    max_age = db.Column(db.Integer)
    min_term = db.Column(db.Integer)
    max_term = db.Column(db.Integer)
    min_sum_assured = db.Column(db.Float)
    description = db.Column(db.Text)
    benefits = db.Column(db.Text)
    tax_benefits = db.Column(db.Text)
    premium_modes = db.Column(db.String(200))  # Yearly, Half-yearly, Quarterly, Monthly
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.password == request.form['password']:  # In production, use proper password hashing
            login_user(user)
            return redirect(url_for('dashboard'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', policies=current_user.policies)

@app.route('/policy/new', methods=['GET', 'POST'])
@login_required
def new_policy():
    if request.method == 'POST':
        policy = Policy(
            policy_number=request.form['policy_number'],
            policy_type=request.form['policy_type'],
            start_date=datetime.strptime(request.form['start_date'], '%Y-%m-%d'),
            premium_amount=float(request.form['premium_amount']),
            user_id=current_user.id
        )
        db.session.add(policy)
        db.session.commit()
        return redirect(url_for('dashboard'))
    return render_template('new_policy.html')

@app.route('/policy/<int:policy_id>')
@login_required
def view_policy(policy_id):
    policy = Policy.query.get_or_404(policy_id)
    if policy.user_id != current_user.id:
        flash('Unauthorized access')
        return redirect(url_for('dashboard'))
    return render_template('view_policy.html', policy=policy)

@app.route('/policies')
def list_policies():
    categories = PolicyCategory.query.all()
    return render_template('policies.html', categories=categories)

@app.route('/policy/<int:policy_id>')
def policy_details(policy_id):
    policy = InsurancePolicy.query.get_or_404(policy_id)
    return render_template('policy_details.html', policy=policy)

# Initialize default policy categories and policies
def init_policies():
    with app.app_context():
        # Create categories if they don't exist
        categories = {
            'Term Insurance': 'Pure protection plans that offer life cover for a specified term',
            'Endowment Plans': 'Savings plus insurance plans that offer maturity benefits along with life cover',
            'Money Back': 'Regular returns during policy term with life insurance coverage',
            'Child Plans': 'Secure your child's future with education and marriage planning',
            'Pension Plans': 'Retirement plans for regular income after retirement',
            'ULIP': 'Unit Linked Insurance Plans combining investment and insurance',
            'Special Plans': 'Special plans for women and differently-abled persons'
        }
        
        for name, desc in categories.items():
            if not PolicyCategory.query.filter_by(name=name).first():
                cat = PolicyCategory(name=name, description=desc)
                db.session.add(cat)
        
        # Commit categories first
        db.session.commit()
        
        # Add some sample policies
        term_cat = PolicyCategory.query.filter_by(name='Term Insurance').first()
        if term_cat and not InsurancePolicy.query.filter_by(name='LIC Tech Term').first():
            policy = InsurancePolicy(
                name='LIC Tech Term',
                policy_number='T901',
                category_id=term_cat.id,
                min_age=18,
                max_age=65,
                min_term=10,
                max_term=40,
                min_sum_assured=50000,
                description='Pure term insurance plan with high coverage at affordable premiums',
                benefits='• High life cover at affordable premiums\n• Optional accidental death benefit\n• Tax benefits under section 80C\n• Multiple premium payment terms',
                tax_benefits='Premium paid and benefits received are eligible for tax benefits under Section 80C and 10(10D)',
                premium_modes='Yearly, Half-yearly, Quarterly, Monthly'
            )
            db.session.add(policy)
        
        # Add more policies here...
        db.session.commit()

if __name__ == '__main__':
    if not os.path.exists('uploads'):
        os.makedirs('uploads')
    with app.app_context():
        db.create_all()
        init_policies()
    app.run(debug=True)
