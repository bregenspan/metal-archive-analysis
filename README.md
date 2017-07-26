# metal-archive-analysis

This project involves some simple n-gram analysis and visualization of heavy metal band names
found on metal-archives.com -- a beautiful site which appears to be the most comprehensive
database of heavy metal bands.

## Setup

 * Ensure that you have Python 3 installed (and that `pip` and `python` commands point to the Python 3 executables).
 * `pip install -r requirements.txt`
 * [Install NLTK corpus data](http://www.nltk.org/data.html#interactive-installer)
 * Download [Jon Charest's Metal Archives scraper](https://github.com/jonchar/ma-scraper/blob/master/MA_band_scraper.py) and use it to scrape a CSV containing a full listing of bands.

## Usage

 * Clean the CSV of scraped metal-archives data and import to a SQLite database:
  `python csv_import.py PATH/TO/FILE-PRODUCED-FROM-PREVIOUS-STEP.csv`
 * Find ngrams in the band names and return JSON with associated band data:
   * (Find words of minimum length 6, maximum length 20, return data for the 20 most common words):
    `python ngrams.py --min 6 --max 20 --max_total 20 > .data/bands.json`

## JSON format

The JSON returned from ngrams.py is structured like so:

 * data *(list)* - list of objects containing ngram strings and list of matching bands
 * data[].word *(string)* - the ngram
 * data[].bands *(list)* - list of bands that match the n-gram
 * data[].bands[].name *(string)* - band name
 * data[].bands[].link *(string)* - band metal-archives.com link
 * data[].bands[].country *(string)* - band country
 * data[].bands[].id - *(integer)* band ID
 * data[].bands[].dupe *(boolean)* - whether there is another band with the same name

Example:

```json
[{
    "word": "nation",
    "bands": [{
        "name": "A Lie Nation",
        "link": "https://www.metal-archives.com/bands/A_Lie_Nation/3540395918",
        "country": "Finland",
        "id": 3540395918,
        "dupe": false
    }, {
        "name": "Abacination",
        "link": "https://www.metal-archives.com/bands/Abacination/3540340651",
        "country": "Iceland",
        "id": 3540340651,
        "dupe": true
    },
    …
    ]
}, {
    "word": "shadow",
    "bands": [{
        "name": "Abstract Shadows",
        "link": "https://www.metal-archives.com/bands/Abstract_Shadows/13251",
        "country": "Brazil",
        "id": 13251,
        "dupe": false
    }, {
        "name": "Age of Shadows",
        "link": "https://www.metal-archives.com/bands/Age_of_Shadows/3540401154",
        "country": "United States",
        "id": 3540401154,
        "dupe": false
    },
    …
},
    …
]
```

## Visualization

See [./visualization/README.md](./visualization/README.md)
