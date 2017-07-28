def tokenize_inward(word: str, dictionary: set) -> set:
    """ Tokenizes compound words using fairly naive approach of shrinking window forward and backward
    from the head and tail of the word. This has the advantage of locating only what are likely to be
    the most significant parts of the compound word -- at least in the case where the word is a
    heavy metal band"s name :)

    >>> # from nltk.corpus import brown
    >>> # dictionary = set(w.lower() for w in brown.words())
    >>> #
    >>> # Minimal dictionary just for test purposes:
    >>> test_dictionary = {"slaughterhouse", "slaughter", "house", "laughter", "aught", "bear", "saint"}

    >>> tokenize_inward("slaughterhouse", test_dictionary) == {"slaughterhouse", "house", "slaughter"}
    True

    Note that we could find no more than word substrings here, even though "slaughterhouse" also
    contains "laughter" and "aught".

    Doesn't handle tokenizing based on whitespace; you should do so beforehand or you'll get
    unexpected results:

    >>> tokenize_inward("slaughterhouse saint", test_dictionary) == {"slaughterhouse", "house", "slaughter", "saint"}
    False
    >>> tokenize_inward("slaughterhouse saint", test_dictionary) == {"slaughterhouse", "slaughter", "saint"}
    True
    """

    words = set()

    def tokenize_inward_recurse(word_back, word_forward):

        # Exit condition. We're not interested in words < 3 characters long
        if not len(word_back) > 2:
            return words

        if word_back in dictionary:
            words.add(word_back)
        if word_forward in dictionary:
            words.add(word_forward)

        return tokenize_inward_recurse(word_back[0:-1], word_forward[1:])

    return tokenize_inward_recurse(word, word)


if __name__ == "__main__":
    import doctest
    doctest.testmod()
