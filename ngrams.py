import argparse
from nltk import FreqDist
from nltk.corpus import brown
import sqlite3

vocab = set(w.lower() for w in brown.words())
DB_FILENAME = 'bands.db'


def get_rows():
    with sqlite3.connect(DB_FILENAME) as conn:
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
        description=('Print n-grams from metal-archives.com scraped CSV, '
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
    for (word, count,) in f.most_common(args.max_total):
        print("{} ({})".format(word, count))
