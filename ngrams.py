"""
Generates JSON containing ngrams found in band names (see README.md and --help output for usage details).
"""

import argparse
from itertools import chain
import json
from nltk import FreqDist
from nltk.corpus import brown
import os
import sqlite3

from tokenize_inward import tokenize_inward

vocab = set(w.lower() for w in brown.words())

DATA_FOLDER = ".data"
DB_FILE = "bands.db"
db_path = os.path.join(DATA_FOLDER, DB_FILE)

# Disallowed word suffixes.
# There are many words like "Damnation" in band names; the suffix "nation" is not
# a meaningful word in this context.
DISALLOW_AS_SUFFIX = {"nation", "ration", "lack", "less"}


def is_disallowed(word: str) -> bool:
    """ Tests for whether the specified word should be filtered out (based on it having a prohibited suffix) """
    for disallowed_suffix in DISALLOW_AS_SUFFIX:
        if word.endswith(disallowed_suffix) and word != disallowed_suffix:
            return True
    return False


def get_rows():
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute("""
            SELECT
                *
            FROM
                bands
            ORDER BY
                `id` ASC
        """):
            yield row


def get_bands(substring):
    with sqlite3.connect(db_path) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute("""
            SELECT
                *
            FROM
                bands
            WHERE
                normalized_name LIKE ?
            ORDER BY
                `name` ASC
        """, ("%{}%".format(substring),)):
            yield row


def all_band_name_ngrams(min_len, max_len):
    """Generates list of all English word ngrams between `min_len` and
        `max_len` found in the band name list"""

    ngrams = []

    for row in get_rows():
        whitespace_tokenized_name = row["name"].lower().split()
        band_ngrams = chain.from_iterable([
            tokenize_inward(word, vocab) for word in whitespace_tokenized_name
            if not is_disallowed(word)
        ])
        ngrams.extend([ngram for ngram in band_ngrams if len(ngram) >= min_len and len(ngram) <= max_len])

    return ngrams


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=("Print n-grams from band names in band database, "
                     "sorted by count"))
    parser.add_argument("--min", default=7, type=int,
                        help="Minimum length of n-grams to search for")
    parser.add_argument("--max", default=14, type=int,
                        help="Maximum length of n-grams to search for")
    parser.add_argument("--max_total", default=50, type=int,
                        help="Maximum number of n-grams to output")

    args = parser.parse_args()
    all_ngrams = all_band_name_ngrams(
        min_len=args.min, max_len=args.max)

    f = FreqDist(all_ngrams)
    words = []
    for (word, count,) in f.most_common(args.max_total):
        bands = [band for band in get_bands(word)]
        seen = set()
        duplicate_names = set()
        for name in [band["name"] for band in bands]:
            if name in seen:
                duplicate_names.add(name)
            seen.add(name)

        names = set([band["name"] for band in bands])
        words.append({
          "word": word,
          "bands": [{
            "name": band["name"],
            "link": band["link"],
            "country": band["country"],
            "id": band["id"],
            "dupe": True if band["name"] in duplicate_names else False
          } for band in bands]
        })
    print(json.dumps(words, indent=2))
