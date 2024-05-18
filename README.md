<!-- # table_charter <a href='https://gitlab.com/urswilke/table_charter'><img src='table_charter_logo.svg' align="right" height="160" /></a> -->

# table_charter

[![pipeline status](img/table_charter_logo.svg)](https://gitlab.com/urswilke/table_charter)

[![pipeline status](https://gitlab.com/urswilke/table_charter/badges/main/pipeline.svg)](https://gitlab.com/urswilke/table_charter/-/commits/main)
[![pipeline status](https://img.shields.io/npm/v/table_charter.svg)](https://npmjs.com/package/table_charter)

WIP!

## Introduction

This javascript package provides a web component `<table-charter>` (using [lit](https://github.com/lit/lit)) that allows to interactively generate charts of the crosstabs in table books (see below). Please open the [demo](https://urswilke.gitlab.io/table_charter/) to see it live.

## Table books

Table books are Excel VBA files to [interactively](....linkToDescrInHomepage_TBD.......) select and show subsets of the contained crosstabs with various survey statistics, produced by DATA-Connection Gebr. Wilke GbR, a small company of my brother and me. The answers to the questions are in the rows and the total and a breakdown of various sub-populations in columns (headers) of the crosstabs.

-   _We generate the table books with 2 R packages which we will also soon 🤞 put open source._
-   _Please contact [us](........linkToOurWebseite_TBD.....) if you're interested in these table books for one of your projects_.

### Example table book

Perhaps it's easiest to dive right into it. For demonstration purposes we have an [example table book](...bsp_tb_TBD.xlsx) (non-interactive, stripped off of all VBA) of a made-up survey (see raw SPSS data of the survey [here](..........bsp_raw_data_TBD.sav)).

## table_charter

When calculating the data in the crosstabs from the raw data, we also translate it to a long format. Each value occupies one row, as needed by [observable plot](https://github.com/observablehq/plot), which is used to generate the charts. Some modifications are then added with [d3](https://github.com/d3/d3). In a nut shell, table_charter loads the long table book data into an app, where you can then also interactively choose the settings of the plots you're interested in.

## Usage

In order to use table_charter you need to load the underlying code into your html. The easiest way is to load the source code of the [npm package](https://www.npmjs.com/package/table_charter) (which you can download from unpkg for every published version) in a stand-alone html file.

### Embedding in html

To understand how you can embed table_charter in html documents, have a look at the [`minimal_example.html`](minimal_example.html) stand-alone html file. When the source code is loaded, it provides the `TableCharter` web component that contains the app which you can embed with the `<table-charter>` tag in your html.

In [example_dashboard.html](example_dashboard.html) we added a header (with the option to change the language of the app; only German and English for now) and a footer and some styling.

### Stand-alone html files

-   You can run the app by downloading a stand-alone html file and open it locally in your browser.
-   Another way is to install the package on your machine (see below) and then generate a stand-alone file with the current state of all the needed javascript code included (in contrast to providing a download link to the unpkg cdn) with `npm run standalone-build`.

### Installation

If you also want to experiment with the code inside the table_charter web component, install it on your machine with (needs git & npm):

```
git clone https://gitlab.com/urswilke/table_charter
cd table_charter
npm i
```

### Dev server

You can then run the app on a dev server on your computer with [vite](https://github.com/vitejs/vite) by entering the following commands in your cli:

```
npm run dev
```

This will run the app in `index.html` and all the related source code on a local dev server (`example_dashboard.html` is a stand-alone verion of `index.html`).

### Deploying it in the web

Our [demo](https://urswilke.gitlab.io/table_charter/) is the result of deploying the production version of the table_charter html element automatically each time code is pushed into this repo (with the `pages` part in the [gitlab ci](.gitlab-ci.yml)). By forking this repo and adapting the data used, you can deploy dashboards with your own data to the web.

### Tests

The tests are made with [webdriverio](https://github.com/webdriverio/webdriverio/) and can be run on firefox with

```
npm run test
```

and on chrome with

```
npm run test -- --chrome
```

They are also run on push with the gitlab ci.

## Outlook

The versatility of the lit element with charts from observable plot and the tidy data structure allow to easily

-   add further options to controll the charts' features & appearance,
-   connect the dashboard to a data base,
-   also allow to generate interactive html versions of the tables in our table books,
-   easily expand the generated plot types, such as
-   plotting the data of multiple questions in different columns, or
-   assembling the survey data of different years
-   etc. ...

## License

Please take not that the source code of this repo is published under the [AGPLv3 license](LICENSE).
