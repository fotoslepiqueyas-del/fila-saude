from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Liberta o acesso para o front-end conseguir ler os dados sem bloqueios

hospitais_data = [
    {
        "id": 1,
        "nome": "Hospital Geral de Carapicuíba",
        "status": "Verde - Normal",
        "tempo_espera": 15,
    },
    {
        "id": 2,
        "nome": "UPA Central Carapicuíba",
        "status": "Amarelo - Movimentado",
        "tempo_espera": 60,
    },
    {
        "id": 3,
        "nome": "Hospital Santa Ana",
        "status": "Vermelho - Lotado",
        "tempo_espera": 180,
    },
]


@app.route("/hospitais", methods=["GET"])
def get_hospitais():
  # Garante que os acentos aparecem corretamente em formato JSON
  return jsonify(hospitais_data), 200, {"Content-Type": "application/json; charset=utf-8"}


if __name__ == "__main__":
  app.run(host="0.0.0.0", port=5001)
