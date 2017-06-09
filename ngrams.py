from nltk import FreqDist
import csv

"""
Stolen from https://codereview.stackexchange.com/a/105990
"""


def get_words():
    """generate english words from the whole gutemberg corpus"""

    with open('metalarchive.csv', 'r') as csvfile:
        reader = csv.reader(csvfile)
        for row in reader:
            yield row[0]


def ngrams(N, word, strict=True):
    """generate a sequence of N-sized substrings of word.
    if strict is False, also account for P-sized substrings
    at the end of the word where P < N"""

    last = N - 1 if strict else 0
    for i in xrange(len(word) - last):
        yield word[i:i+N]

def m_most_common_ngram_chars(M=5, N=3):
    """gets the top M most common substrings of N characters in English words"""
    f = FreqDist(ngram for ngram in ngrams(N, word) for word in get_words())
    return f.most_common(M)

if __name__ == "__main__":
    # Uses the default values M=5, N=3
    print m_most_common_ngram_chars()
