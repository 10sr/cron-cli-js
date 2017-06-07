[![NPM version](http://img.shields.io/npm/v/cron-cli.svg)](https://www.npmjs.com/package/cron-cli)
[![Downloads](https://img.shields.io/npm/dm/cron-cli.svg)](https://www.npmjs.com/package/cron-cli)
[![Build Status](https://travis-ci.org/10sr/cron-cli.svg?branch=master)](https://travis-ci.org/10sr/cron-cli)
[![Dependency Status](https://david-dm.org/10sr/cron-cli.svg)](https://david-dm.org/10sr/cron-cli)

cron-cli-js
========

Cron command implemented in Nodejs


Overview
--------

Write your crontab file as:

    00 30 11 * * 1-5 echo foo
    10 23 0-23/2 * * * echo bar 1>&2

And start cron in foreground with that crontab file:

    $ cron ./crontab


Usage
-----

### Commandline Options

    $ cron [--exit-on-failure] [--timezone <timeZone>] <crontab>

| Option | Default  | Description |
| ------ | -------- | ----------- |
| `--exit-on-failure` | (None) | When given and any of jobs ends with status code other than 0, exit cron program with that status code |
| `--timezone <timeZone>` | (None) | When given, set timezone for cron jobs |




### Crontab Format

A sample crontab file will look like:

    # sec min hour day month day-of-week command
    # Runs every weekday (Monday through Friday) at 11:30:00 AM
    00 30 11 * * 1-5 echo foo
    # Runs 23 minutes 10 seconds after midn, 2am, 4am ..., everyday
    10 23 0-23/2 * * * echo bar 1>&2

Where each number represents seconds, munites, hours, day of month, 
months and day of week respectively.
All trailing texts are treated as shell command to execute.

Lines that start with `#` are treated as comments and are ignored.

Jobs are scheduled with [node-cron](https://www.npmjs.com/package/cron),
so see its document for details about available cron time format.

Specifying environment variables in crontab file is not supported.



License
-------

Copyright (c) 2017 10sr <8.slashes@gmail.com>

This software is licensed under the Apache License, Version 2.0 ,
see `LICENSE` for details.
