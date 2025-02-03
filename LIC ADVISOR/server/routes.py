from flask import Blueprint, request, jsonify
from datetime import datetime
from database import db, Customer

customers = Blueprint('customers', __name__)

@customers.route('/api/customers', methods=['GET'])
def get_customers():
    try:
        customers = Customer.query.all()
        return jsonify([customer.to_dict() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@customers.route('/api/customers', methods=['POST'])
def create_customer():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'address', 'dob']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Check if email already exists
        if Customer.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400

        # Generate customer ID
        customer_id = 'CUST' + datetime.now().strftime('%y%m%d%H%M%S')

        # Create new customer
        new_customer = Customer(
            id=customer_id,
            name=data['name'],
            email=data['email'],
            phone=data['phone'],
            address=data['address'],
            dob=datetime.strptime(data['dob'], '%Y-%m-%d').date(),
            status='active'
        )

        db.session.add(new_customer)
        db.session.commit()

        return jsonify(new_customer.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers.route('/api/customers/<customer_id>', methods=['PUT'])
def update_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        data = request.get_json()
        
        # Update fields
        if 'name' in data:
            customer.name = data['name']
        if 'email' in data and data['email'] != customer.email:
            # Check if new email already exists
            if Customer.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            customer.email = data['email']
        if 'phone' in data:
            customer.phone = data['phone']
        if 'address' in data:
            customer.address = data['address']
        if 'dob' in data:
            customer.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
        if 'status' in data:
            customer.status = data['status']

        customer.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify(customer.to_dict())
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers.route('/api/customers/<customer_id>', methods=['DELETE'])
def delete_customer(customer_id):
    try:
        customer = Customer.query.get(customer_id)
        if not customer:
            return jsonify({'error': 'Customer not found'}), 404

        db.session.delete(customer)
        db.session.commit()

        return jsonify({'message': 'Customer deleted successfully'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@customers.route('/api/customers/search', methods=['GET'])
def search_customers():
    try:
        query = request.args.get('q', '').lower()
        
        customers = Customer.query.filter(
            db.or_(
                Customer.name.ilike(f'%{query}%'),
                Customer.email.ilike(f'%{query}%'),
                Customer.phone.ilike(f'%{query}%'),
                Customer.id.ilike(f'%{query}%')
            )
        ).all()
        
        return jsonify([customer.to_dict() for customer in customers])
    except Exception as e:
        return jsonify({'error': str(e)}), 500
