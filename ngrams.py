from nltk import FreqDist
from nltk.corpus import words
import csv
import re

"""
Stolen from https://codereview.stackexchange.com/a/105990
"""

vocab = set(w.lower() for w in words.words())

import argparse

parser = argparse.ArgumentParser(description='Get ngrams from metal-archives.com scraped CSV')
parser.add_argument('--size', default=10, type=int,
                    help='Length of n-grams to search for')
args = parser.parse_args()


def get_words():
    with open('MA-band-names_2017-06-09.csv', 'r') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            match_name_in_link = re.search('\'>(.*)</a>', row[1])
            if match_name_in_link is not None:
                yield match_name_in_link.group(1).replace(' ', '').lower()


def ngrams(N, word, strict=True):
    """generate a sequence of N-sized substrings of word.
    if strict is False, also account for P-sized substrings
    at the end of the word where P < N"""

    last = N - 1 if strict else 0
    for i in range(len(word) - last):
        if word[i:i+N] in vocab:
            yield word[i:i+N]

def m_most_common_ngram_chars(N, M=50):
    """gets the top M most common substrings of N characters in English words"""
    f = FreqDist(ngram for word in get_words() for ngram in ngrams(N, word))
    return f.most_common(M)

if __name__ == "__main__":
    seven_letter_ngrams = m_most_common_ngram_chars(M=50, N=args.size)
    print("\n\n\n")
    for (word, count,) in seven_letter_ngrams:
        print("                {} ({})".format(word, count))

