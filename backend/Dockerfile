FROM python:3.9-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le code de l'application
COPY . .

# Port que Gunicorn va écouter
EXPOSE 5000

# Commande pour lancer l'application avec Gunicorn
# --bind 0.0.0.0:5000 pour écouter sur toutes les interfaces réseau
# app:app -> nom_du_fichier:nom_de_l_instance_flask
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
