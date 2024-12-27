from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask import request
from flask_cors import CORS  # Importa Flask-CORS



app = Flask(__name__)

CORS(app)  # Abilita CORS per tutta l'app

#Configurazione MongoDB
app.config["MONGO_URI"] = "mongodb://frabru99:ciao@localhost:27017/admin"
mongo = PyMongo(app)
db = mongo.db


@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Flask MongoDB server!"})


#query a mongoDB
@app.route('/admin', methods=['POST'])
def search_name():

    data=request.get_json()

    print(data)

    user = data.get('username')
    passw = data.get('password')

    if not user:
        return jsonify({"error": "Username non specificato"}), 400

    if not passw:
        return jsonify({"error": "Password non specificata"}), 400


    try:
        result = db.db_webrtc.find_one({"username": user, "password": passw })
        if result:
            return jsonify({"message": "UTENTE AUTORIZZATO!"}), 200
        else:
            return jsonify({"message": "Utente non trovato!"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)  # Cambia 8080 con il numero di porta desiderato