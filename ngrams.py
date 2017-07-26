"""
Generates JSON containing ngrams found in band names (see README.md and --help output for usage details).

I used Mathias Ettinger's nice example [here](https://codereview.stackexchange.com/a/105990) as a starting point for
the ngram generation approach.
"""

import argparse
import json
from nltk import FreqDist
from nltk.corpus import brown
import os
import sqlite3

vocab = set(w.lower() for w in brown.words())

DATA_FOLDER = '.data'
DB_FILE = 'bands.db'
db_path = os.path.join(DATA_FOLDER, DB_FILE)


def get_rows():
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute('''
            SELECT
                *
            FROM
                bands
            ORDER BY
                `id` ASC
        '''):
            yield row


def get_bands(substring):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute('''
            SELECT
                *
            FROM
                bands
            WHERE
                normalized_name LIKE ?
            ORDER BY
                `name` ASC
        ''', ('%{}%'.format(substring),)):
            yield row


def ngrams(length, word):
    """Generate a sequence of `length`-sized English word substrings
        of `word`"""
    for i in range(len(word) - (length - 1)):
        if word[i:i + length] in vocab:
            yield word[i:i + length]


def all_ngrams_for_word(word, min_len, max_len):
    return [ngram
            for size in range(min_len, max_len + 1)
            for ngram in ngrams(size, word)]


def all_band_name_ngrams(min_len, max_len):
    """Generates list of all English word ngrams between `min_len` and
        `max_len` found in the band name list"""

    ngrams = []

    for row in get_rows():
        normalized_name = row['name'].replace(' ', '').lower()
        band_ngrams = all_ngrams_for_word(
            normalized_name, min_len, max_len)
        ngrams.extend(band_ngrams)

    return ngrams


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=('Print n-grams from band names in band database, '
                     'sorted by count'))
    parser.add_argument('--min', default=7, type=int,
                        help='Minimum length of n-grams to search for')
    parser.add_argument('--max', default=14, type=int,
                        help='Maximum length of n-grams to search for')
    parser.add_argument('--max_total', default=50, type=int,
                        help='Maximum number of n-grams to output')

    args = parser.parse_args()
    all_ngrams = all_band_name_ngrams(
        min_len=args.min, max_len=args.max)

    f = FreqDist(all_ngrams)
    words = []
    for (word, count,) in f.most_common(args.max_total):
        bands = [band for band in get_bands(word)]
        seen = set()
        duplicate_names = set()
        for name in [band['name'] for band in bands]:
            if name in seen:
                duplicate_names.add(name)
            seen.add(name)

        names = set([band['name'] for band in bands])
        words.append({
          'word': word,
          'bands': [{
            'name': band['name'],
            'link': band['link'],
            'country': band['country'],
            'id': band['id'],
            'dupe': True if band['name'] in duplicate_names else False
          } for band in bands]
        })
    print(json.dumps(words, indent=2))
