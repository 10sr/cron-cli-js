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
    var rl = readline.createInterface({
        input: fs.createReadStream(crontab)
    });

    rl.on("line", function(line){
        var parsed = parseCrontab(line);
        var job = new CronJob({
            cronTime: parsed.cronTime,
            onTick: function(){
                var proc = childProcess.spawn(parsed.command, {
                    shell: true,
                    stdio: ["ignore", "pipe", "pipe"]
                });

                proc.stdout.on('data', function(data){
                    console.log(parsed.command + " | stdout: " + data.toString().trim());
                });
                proc.stderr.on('data', function(data){
                    console.log(parsed.command + " | stderr: " + data.toString().trim());
                });
                proc.on('close', function(code){
                    console.log(parsed.command + " | exited with code " +
                                code.toString());
                });
            },
            start: true
        });
        console.dir(parsed);
    });
};
