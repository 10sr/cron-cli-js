/*
 * Copyright (c) 2017 10sr <8.slashes@gmail.com>
 * Licensed under the Apache License, Version 2.0
 */

var readline = require("readline");
var fs = require("fs");
var childProcess = require("child_process");

var CronJob = require("cron").CronJob;
var nodemailer = require("nodemailer");

var parseCrontabRe = new RegExp(/^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);

function createMailTransporter(opts){
    if (!opts.mailto) {
        return null;
    }

    var mailDefaults = {
        // TODO: fix sender
        from: "cron-js@3ends.info",
        to: opts.mailto
    };

    if (opts.smtpHost || opts.smtpPort ||
        opts.smtpUser || opts.smtpPass) {
        return nodemailer.createTransport({
            host: opts.smtpHost,
            port: opts.smtpPort,
            secure: opts.smtpSecure,
            auth: {
                user: opts.smtpUser,
                pass: opts.smtpPass
            }
        }, mailDefaults);
    } else {
        return nodemailer.createTransport({
            sendmail: true,
            newline: "unix"
        }, mailDefaults);
    }
}

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
    var mailTransporter = createMailTransporter(opts);

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
                        console.log(parsed.command + " | stdout: " + stdout.trim());
                        console.log(parsed.command + " | stderr: " + stderr.trim());
                        if (err) {
                            console.log(parsed.command + " | error:  " + err.toString())
                            console.log(parsed.command + " | exited with code " +
                                        err.code.toString());
                        } else {
                            console.log(parsed.command + " | exited")
                        }

                        if (mailTransporter) {
                            var mailText = "stdout:\n\n" + stdout +
                                "\n\nstderr:\n\n" + stderr;
                            if (err) {
                                mailText = mailText + "\n\nerror: " + err.toString() +
                                    "\n\nExit code: " + err.code.toString();
                            }
                            mailTransporter.sendMail({
                                subject: "Cron-JS <> " + parsed.command,
                                text: mailText
                            }, function(err, info){
                                if (err) {
                                    console.log("Failed to send mail: " + err.toString());
                                }
                                console.log("Mail sent to " + opts.mailto);
                            });
                        }

                        if (err && exitOnFailure) {
                            console.log("Aborting.");
                            process.exit(err.code);
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
