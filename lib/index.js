/*
 * Copyright (c) 2017 10sr <8.slashes@gmail.com>
 * Licensed under the Apache License, Version 2.0
 */

var readline = require("readline");
var fs = require("fs");
var childProcess = require("child_process");

var CronJob = require("cron").CronJob;

var parseCrontabRe = new RegExp(/^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);

function parseCrontab(line){
    var matched = parseCrontabRe.exec(line);
    if (!matched) {
        throw Error("Failed to parse crontab line: " + line);
    }
    return {
        cronTime: [
            matched[1], matched[2], matched[3],
            matched[4], matched[5], matched[6]
        ].join(" "),
        command: matched[7]
    }
}

exports.start = function(crontab, opts){
    var exitOnFailure = Boolean(opts.exitOnFailure);
    var timeZone = opts.timeZone || null;

    var rl = readline.createInterface({
        input: fs.createReadStream(crontab)
    });

    rl.on("line", function(line){
        if (line.match(/^#/)) {
            return;
        }
        var parsed = parseCrontab(line);
        var cronJobOpts = {
            cronTime: parsed.cronTime,
            onTick: function(){
                var proc = childProcess.exec(
                    parsed.command,
                    {},
                    function(err, stdout, stderr){
                        console.log(parsed.command + " | stdout: " + stdout);
                        console.log(parsed.command + " | stderr: " + stderr);
                        if (err) {
                            console.log(parsed.command + " | exited with code " +
                                        err.code.toString());
                            console.log("Aborting.");
                            process.exit(err.code);
                        } else {
                            console.log(parsed.command + " | exited")
                        }
                    }
                );
            },
            start: true
        };
        if (timeZone) {
            cronJobOpts.timeZone = timeZone;
        }

        var job = new CronJob(cronJobOpts);
        console.dir(parsed);
    });
};
