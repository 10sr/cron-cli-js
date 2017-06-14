[![Build Status](https://travis-ci.org/10sr/cron-cli-js.svg?branch=master)](https://travis-ci.org/10sr/cron-cli-js)
[![NPM version](http://img.shields.io/npm/v/cron-cli.svg)](https://www.npmjs.com/package/cron-cli)
[![Dependency Status](https://david-dm.org/10sr/cron-cli-js.svg)](https://david-dm.org/10sr/cron-cli-js)
[![Downloads](https://img.shields.io/npm/dm/cron-cli.svg)](https://www.npmjs.com/package/cron-cli)
[![Docker Pulls](https://img.shields.io/docker/pulls/10sr/cron-js.svg)](https://hub.docker.com/r/10sr/cron-js)
[![](https://images.microbadger.com/badges/version/10sr/cron-js.svg)](https://microbadger.com/images/10sr/cron-js "Get your own version badge on microbadger.com")



CRON_JS
=======

Simple cron command implementation in Nodejs


* Define job schedules in standard crontab-like format
  * Extended to support seconds digit
* No "daemon mode": all status informations are printed to stdout,
including outputs of executed jobs
* Support email for sending job results: both sendmail command and SMTP
are supported


Requirement
-----------

* Nodejs >= 6.0


Usage Example
-------------

Write your crontab file as:

    */10 * * * * * echo CRONJOB.mbp `date`

And start cron in foreground with that crontab file:

    $ CRON_JS_MAILTO=user@example.com cron ./crontab


`cron` sends all job outputs to stdout, and also send them to
`user@example.com`.

    $ CRON_JS_MAILTO=user@example.com ./bin/cron crontab.test
    { cronTime: '*/10 * * * * *',
    command: 'echo CRONJOB.mbp `date`' }
    2017-06-13T04:24:40.743Z | echo CRONJOB.mbp `date` | stdout: CRONJOB.mbp Tue Jun 13 13:24:40 JST 2017
    2017-06-13T04:24:40.743Z | echo CRONJOB.mbp `date` | stderr:
    2017-06-13T04:24:40.743Z | echo CRONJOB.mbp `date` | exited
    2017-06-13T04:24:40.743Z | echo CRONJOB.mbp `date` | Sending email to user@example.com
    2017-06-13T04:24:50.741Z | echo CRONJOB.mbp `date` | stdout: CRONJOB.mbp Tue Jun 13 13:24:50 JST 2017
    2017-06-13T04:24:50.741Z | echo CRONJOB.mbp `date` | stderr:
    2017-06-13T04:24:50.741Z | echo CRONJOB.mbp `date` | exited
    2017-06-13T04:24:50.741Z | echo CRONJOB.mbp `date` | Sending email to user@example.com
    ...



Arguments
---------

### Command Usage

    $ [<EMAIL_OPTIONS= > ...] cron [--exit-on-failure] [--timezone <timeZone>] [<email options> ...] <crontab>

| Arguments | Required  | Description |
| --------- | --------- | ----------- |
| `<crontab>` | Yes | crontab file that defines jobs to schedule, one per line
| `--exit-on-failure` | No | When given and any of jobs ends with status code other than 0, exit cron program with that status code |
| `--timezone <timeZone>` | No | When given, set timezone for cron job definitions |
| `--mailto <address>`, `--smtp-host <host>`, `--smtp-port <port>`, `--smtp-user <user>`, `--smtp-pass <password>` | No | Email notifiction options: see below for details |




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



### Email Options

Following email options are supported.

Email options can be also passed via environment vairbles.
When both are provided, values given in commandline argument always
take precedence.

| Arguments | Environment Variable | Description |
| --------- | -------------------- | ----------- |
| `--mailto <address>` | `CRON_JS_MAILTO` | Email address to send result to
| `--smtp-host <host>` | `CRON_JS_SMTP_HOST` | SMTP host to use to send emails
| `--smtp-port <port>` | `CRON_JS_SMTP_PORT` | SMTP port to use to send emails
| `--smtp-user <user>` | `CRON_JS_SMTP_USER` | SMTP username to use to send emails
| `--smtp-pass <password>` | `CRON_JS_SMTP_PASS` | SMTP password to use to send emails


There are two email "mode" for `cron`:

- When only `--mailto` (or `CRON_JS_MAILTO`) is given of these email options,
 `cron` works in "sendmail" mode.
In this mode, `cron` tries to send emails via locally installed `sendmail`
command.

- If any of SMTP options are given, `cron` works in "SMTP" mode,
where `cron` tries to send emails using provided STMP configurations.



License
-------

Copyright (c) 2017 10sr <8.slashes@gmail.com>

This software is licensed under the Apache License, Version 2.0 ,
see `LICENSE` for details.
