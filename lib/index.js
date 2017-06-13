/*
 * Copyright (c) 2017 10sr <8.slashes@gmail.com>
 * Licensed under the Apache License, Version 2.0
 */

var readline = require("readline");
var fs = require("fs");
var childProcess = require("child_process");
var os = require("os");

var CronJob = require("cron").CronJob;
var nodemailer = require("nodemailer");
var logger = require("log4js").getLogger();

var parseCrontabRe = new RegExp(/^\s*(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(.+)$/);

var SENDER_DEFAULT = os.userInfo().username + "@" + os.hostname();

function createMailTransporter(opts){
    if (!opts.mailto) {
        return null;
    }

    logger.info("Setting up email notification");
    logger.info("Sender: " + SENDER_DEFAULT);
    logger.info("Mailto: " + opts.mailto);
    var mailDefaults = {
        from: SENDER_DEFAULT,
        to: opts.mailto
    };

    if (opts.smtpHost || opts.smtpPort ||
        opts.smtpUser || opts.smtpPass) {
        logger.info("Use SMTP to send emails");
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
        logger.info("Use sendmail to send emails");
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
                var currentTime = new Date();
                // TODO: use timezone
                var dateStr = currentTime.toISOString();
                var leadingMarker = dateStr + " | " + parsed.command + " | ";
                var proc = childProcess.exec(
                    parsed.command,
                    {},
                    function(err, stdout, stderr){
                        logger.info(leadingMarker + "stdout: " + stdout.trim());
                        logger.info(leadingMarker + "stderr: " + stderr.trim());
                        if (err) {
                            logger.warn(leadingMarker + "error:  " + err.toString())
                            logger.warn(leadingMarker + "exited with code " +
                                        err.code.toString());
                        } else {
                            logger.info(leadingMarker + "exited with code 0")
                        }

                        if (mailTransporter) {
                            logger.debug(leadingMarker +
                                        "Sending email to " + opts.mailto);
                            var mailText = "stdout:\n\n" + stdout +
                                "\n\nstderr:\n\n" + stderr;
                            if (err) {
                                mailText = mailText + "\n\nerror: " + err.toString() +
                                    "\n\nExit code: " + err.code.toString();
                            }
                            var mailSubject = "Cron-JS <" + SENDER_DEFAULT +
                                "> " + parsed.command;
                            mailTransporter.sendMail({
                                // TODO: fix title
                                subject: mailSubject,
                                text: mailText
                            }, function(err, info){
                                if (err) {
                                    logger.warn(leadingMarker +
                                                "Failed to send mail: " + err.toString());
                                }
                            });
                        }

                        if (err && exitOnFailure) {
                            // TODO: Remove this: this stop sending email!
                            logger.warn("Aborting.");
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
        logger.info(parsed);
    });
};
