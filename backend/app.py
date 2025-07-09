import os
import time
import psycopg2
from psycopg2.extras import RealDictCursor
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Note: CORS n'est techniquement plus nécessaire avec le reverse proxy Nginx,
# mais c'est une bonne pratique de le garder pour des tests directs sur l'API.
CORS(app)

DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    # Arrête l'application si la configuration essentielle est manquante
    raise ValueError("La variable d'environnement DATABASE_URL n'est pas définie.")

def get_db_connection():
    """Tente de se connecter à la base de données avec plusieurs essais."""
    retries = 5
    while retries > 0:
        try:
            conn = psycopg2.connect(DATABASE_URL)
            return conn
        except psycopg2.OperationalError:
            retries -= 1
            print("Database not ready, waiting...")
            time.sleep(5)
    raise Exception("Could not connect to the database.")

def initialize_db():
    """Crée la table et insère les données de démo."""
    print("Attempting to initialize the database...")
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute('DROP TABLE IF EXISTS employees;')
            cur.execute('''
                CREATE TABLE employees (
                    id INT PRIMARY KEY,
                    name VARCHAR(100),
                    position VARCHAR(100),
                    manager_id INT REFERENCES employees(id)
                );
            ''')
            cur.execute('''
                INSERT INTO employees (id, name, position, manager_id) VALUES
                (1, 'Jean Dupont', 'Maire', NULL),
                (2, 'Marie Martin', 'Directrice Générale des Services', 1),
                (3, 'Luc Bernard', 'Directeur de Cabinet', 1),
                (4, 'Sophie Dubois', 'Directrice des Services Techniques', 2),
                (5, 'Paul Robert', 'Responsable Urbanisme', 4),
                (6, 'Chloé Petit', 'Chargée de Communication', 3);
            ''')
            conn.commit()
            print("Database initialized successfully.")
    except Exception as e:
        print(f"Error initializing database: {e}")
        conn.rollback()
    finally:
        conn.close()

@app.route('/api/organization-chart')
def get_organization_chart():
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT * FROM employees ORDER BY id;')
            employees = cur.fetchall()
            return jsonify(employees)
    finally:
        conn.close()

# Initialiser la base de données au démarrage de l'application
if __name__ != '__main__':
    initialize_db()
