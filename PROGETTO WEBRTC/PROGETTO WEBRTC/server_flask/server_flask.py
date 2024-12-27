from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask import request

app = Flask(name)

Configurazione MongoDB
app.config["MONGO_URI"] = "mongodb://antonio:antonio@localhost:27017/admin"
mongo = PyMongo(app)
db = mongo.db


@app.route('/')
def index():
    return jsonify({"message": "Welcome to the Flask MongoDB server!"})


#query a mongoDB
@app.route('/search', methods=['GET'])
def search_name():
    user = request.args.get('username')
    passw = request.args.get('password')

    if not user:
        return jsonify({"error": "Username non specificato"}), 400

    if not passw:
        return jsonify({"error": "Password non specificata"}), 400


    try:
        result = db.db_webrtc.find_one({"username": user, "password": passw })
        if result:
            return jsonify({"username": user, "password": passw, "message": "UTENTE AUTORIZZATO!"})
        else:
            return jsonify({"message": "Utente non trovato!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if name == 'main':
    app.run(debug=True, port=8080)  # Cambia 8080 con il numero di porta desiderato