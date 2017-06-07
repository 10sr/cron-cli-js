crond-js
========

Crond command implemented in Nodejs


Overview
--------

Write your crontab file as:

    # Runs every weekday (Monday through Friday) at 11:30:00 AM
    00 30 11 * * 1-5 echo foo
    # Runs 23 minutes 10 seconds after midn, 2am, 4am ..., everyday
    10 23 0-23/2 * * * echo bar 1>&2

And start crond in foreground with that crontab file:

    $ crond ./crontab


Usage
-----

### Commandline Options

    $ crond [--exit-on-failure] <crontab>

| Option               | Default  | Description |
| -------------------- | -------- | ----------- |
| `--exit-on-failure`  | (None)   | When given and any of jobs ends with status code other than 0, exit crond program with that status code |




### Crontab Format

The crontab file should look like:

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
