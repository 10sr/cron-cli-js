crond-js
========

Nodejs crond


Overview
--------

Write your crontab as:

    * * * * * * date 2>&1
    00 30 11 * * 1-5 date 2>&1

And start crond in foreground with crontab file:

    crond ./crontab


Usage
-----

    crond [--exit-on-failure] <crontab>


License
-------

This software is released under MIT license. 
See `LICENSE` for details.
