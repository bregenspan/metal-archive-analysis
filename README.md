# metal-archive-analysis

## scraper.py

This is an unmodified copy of [Jon Charest](http://github.com/jonchar)'s metal-archives
scraper. (TODO: remove from checkin, just link out, before publishing this)

It scrapes metal-archive's full band list into a CSV.

## csv_import.py

This imports a CSV exported using Jon Charest's scraper into SQLite, extracting some
further details from the HTML in the CSV (including metal-archives' primary
key for each band), and creating a "bands" table with the fields:

 * id
 * link
 * name
 * normalized_name (lowercased version of name with spaces removed, for search)
 * country
 * genre
 * status

## ngrams.py

This builds a list of English word ngrams, of a specified range of lengths, found
in the band names in the "bands" table. It outputs a list of most frequently-occurring
ngrams. 

It also produces a `bands_ngrams` table mapping band IDs to ngrams. (NOTE: is this at
all useful? Maybe can just use full-text search to achieve any meaningful result)
