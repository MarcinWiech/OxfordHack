import spacy
import os
from flask import Flask, render_template, request, jsonify

app = Flask(__name__)
nlp = None
MODEL = 'en_core_web_sm'
CATEGORIES = 'fuel shelter water clothins food toiletries utilities'
THRESHOLD = 0.50

@app.route('/categorise', methods=['POST'])
def categorise():
    if not request.json or 'text' not in request.json:
        return jsonify({'success': False, 'error': 'Text not found.'}), 400

    text = request.json['text']

    # Extract tokens from spaCy
    cats = nlp.get_categories(text)
    return jsonify({'success': True, 'data': cats})


class NLP:
    def __init__(self):
        self.nlp = spacy.load(MODEL)
        self.cats = self.nlp(CATEGORIES)
        print("spaCy loaded.")

    def get_categories(self, text):
        doc = self.nlp(text)

        cats = set()

        for cat in self.cats:
            for word in doc:
                similarity = word.similarity(cat)
                if similarity >= THRESHOLD:
                    print(word, cat, word.similarity(cat))
                    cats.add(cat.text)

        return list(cats)


if __name__ == '__main__':
    nlp = NLP()
    app.run(debug=True)
