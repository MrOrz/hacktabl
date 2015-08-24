hacktabl.org
================

[![Build Status](https://travis-ci.org/g0v/hacktabl.svg?branch=dev)](https://travis-ci.org/g0v/hacktabl)

A site to publish cooperative comparison table in Google Doc, using [Ethercalc](http://ethercalc.org) to host the table configuration.


Demo
----

### Basic usage

Example: [Doraemon compare table](http://hacktabl.org/doratable) or [FEPZ compare table](http://hacktabl.org/fepz).

* Multiple perspectives (Rows)
* Multiple positions (Columns)
* Showing references for each argument.
* Tooltips over words that needs further explanation.
* Use public Google Doc as the data source so that everyone can edit.
* Label with `[some-label-text]` at the beginning of each argument.

### Table view

Example: [FEPZ compare table for agriculture](http://hacktabl.org/fepz-agriculture)

* Succinct summaries for each table cell so that the table gives a bigger picture for the issue.
* Clicking the table row toggles further arguments for that specific pespective.


Setup a New Hacktabl
--------------------

To publish a comparison table on hacktabl.org, you need:

1. **A Google doc** that has a table in its content, and is shared with "anyone with link". Note that you may have to *allow anyone to comment* in order to make use of the google doc comments.
2. **An public webpage** that explains the table to new visitors. The page will show up in a modal dialog when an user first visits your table. A published google doc or print URL of Hackpad is sufficient.
3. Come up with a **table ID**, which makes up the URL of your table.

Visit `http://ethercalc.org/<table-id>`, you will see an empty spreadsheet.
You may copy-paste the following configuration (does not include table header!) to the spreadsheet:

Config | Value | Comments
---- | ---- | ----
TITLE    | | (Title of the table)
DOC_ID   | | (The URL fragment between `https://docs.google.com/document/d/` and `/edit` of the google doc that contains a table)
INFO_URL | | (URL to a introduction webpage)

Fill the 2nd column with the information of your table, then you are good to go. Visit `http://hacktabl.org/<table-id>` for your new, collaborative comparison table!


Configuration Reference
-----------------
To see the settings of an existing table, say `http://hacktabl.org/<table-id>`, just visit `http://ethercalc.org/<table-id>`. To create a new hacktabl, simply create a new spreadsheet with a desired table ID in EtherCalc.


### Required Settings
* `TITLE`: The title that shows in the title bar and at the top of a table.
* `DOC_ID`: The ID of the Google Document that contains a table.
* `INFO_URL`: An url to a web page that provides further information for the readers. It will show up in a popup dialog when the user enters a hacktabl for the first time.

### Optional Settings

* `TYPE`: Whether or not to represent each cell with a short summary so that the entire table looks more succinct. Can be either empty or `TABLE`. For a running example, please refer to [FEPZ comparison table for education](http://hacktabl.org/fepz-edu) and [its settings on EtherCalc](http://ethercalc.org/fepz-edu).
* `LABEL_SUMMARY`: Use popular labels as summary for each cell. The value can be an integer `n`, which tells hacktabl to take top `n` labels from the cell and make up a summary for the cell. Currently only used for `TYPE=TABLE` tables. Example: [Political promises in 2016 Presidential election in Taiwan](http://hacktabl.org/president2016-table).
* `HIGHLIGHT`: Whether or not to enable bold, italic and underlines. Can be either empty or `TRUE`. For a running example, please refer to [Copyright 2014](http://hacktabl.org/copyright2014) and [its settings on EtherCalc](http://ethercalc.org/copyright2014).
* `EMPHASIZE_NO_REF`: Whether or not to emphasize the arguments with no references. Can be either empty or `TRUE`. For a running example, please refer to [Taipei Mayoral Election](http://hacktabl.org/taipei-mayoral-election-2014) and [its settings on EtherCalc](http://ethercalc.org/taipei-mayoral-election-2014).
Also, for each key-value pairs defined in the EtherCalc, a `<meta property="KEY" content="VALUE">` element will be inserted into <head>. Properties like `og:image` can be set with this technique.


Development
-----------

After cloning the repository, please do the following in the repository folder:

```
npm install
```

Bower components are included in repository so there's no need to do `bower install`.

To start development server, please do:

```
npm start
```

And open up `http://localhost:5000` to see the working website.

When developing parsers, please run unit test using:

```
npm run test:watch
```


Deploy to Github Pages
----------------------

Open up `Makefile` and make necessary changes to variable `GIT` and `DEPLOY_BRANCH`, then execute `make deploy`.
