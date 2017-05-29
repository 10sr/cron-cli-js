#!/bin/sh
set -eux

timeout=$(which timeout || true)
test -z "$timeout" && timeout=$(which gtimeout || true)
test -n "$timeout"

output=$(ARG=DEF $timeout 3 ./bin/crond ./test/crontab || true)

echo "$output" | grep ABCDEF

$timeout 3 ./bin/crond ./test/crontab.broken && true

test $? -eq 1

$timeout 3 ./bin/crond --exit-on-failure ./test/crontab.exit_on_failure && true

test $? -eq 20
