from flask import Flask, jsonify, request
from flask_restful import Resource, Api

app = Flask(__name__)
api = Api(app)

valore_posti=10


class Example(Resource):
    def get(self):
        return  valore_posti


class Example2(Resource):
    def post(self):
        global valore_posti
        data = request.get_json()
        valore_posti=data.get('posti')
        return valore_posti, 201



api.add_resource(Example, '/places')
api.add_resource(Example2, '/change_places')



if __name__ == '__main__':
    app.run(debug='True')