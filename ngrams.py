import argparse
from nltk import FreqDist
from nltk.corpus import words
import sqlite3

vocab = set(w.lower() for w in words.words())
DB_FILENAME = 'bands.db'


def get_rows():
    with sqlite3.connect(DB_FILENAME) as conn:
        conn.row_factory = sqlite3.Row  # dicts for rows
        cursor = conn.cursor()
        for row in cursor.execute('SELECT * FROM bands'):
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

    with sqlite3.connect(DB_FILENAME) as conn:
        cursor = conn.cursor()
        for row in get_rows():
            normalized_name = row['name'].replace(' ', '').lower()
            band_ngrams = all_ngrams_for_word(
                normalized_name, min_len, max_len)
            print([(row['id'], ngram,) for ngram in band_ngrams if ngram])
            cursor.executemany(
                '''
                INSERT INTO
                    `bands_ngrams` (band_id, ngram)
                VALUES
                    (?, ?)
                ''',
                [(row['id'], ngram,) for ngram in band_ngrams])

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

    with sqlite3.connect(DB_FILENAME) as conn:
        cur = conn.cursor()
        cur.execute('DROP TABLE IF EXISTS `bands_ngrams`')
        cur.execute('''CREATE TABLE `bands_ngrams` (
                        band_id INTEGER,
                        ngram CHAR(50)
                    )''')

    args = parser.parse_args()
    all_ngrams = all_band_name_ngrams(
        min_len=args.min, max_len=args.max)

    print([ng for ng in all_ngrams])
    f = FreqDist(all_ngrams)
    for (word, count,) in f.most_common(args.max_total):
        print("{} ({})".format(word, count))
