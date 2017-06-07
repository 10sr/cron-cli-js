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

Copyright (c) 2017 10sr <8.slashes@gmail.com>

This software is licensed under the Apache License, Version 2.0
See `LICENSE` for details.
