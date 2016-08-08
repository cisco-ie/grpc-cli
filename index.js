//cli lib
var program = require('commander');
//general data transform utility
var _ = require('lodash');
//used for nested object searching
_.mixin(require("lodash-deep"));
//google's grpc
var grpc = require('grpc');
//the filesystem
var fs = require("fs");
//used to resolve filepaths cross-os's
var path = require('path');
//used for creating my own repl
var repl = require('repl');
//dot object notation utility
var dot = require('dot-object')
	//core nodejs utils - used for inpecting objects
var util = require('util');


var protoFile, hostPort, rpcService, rpcCommand, rpcParam;


//setup the cli argument parsing 
program
	.version('1.0.2')
	.arguments('<protoFile> [hostPort] [rpcCommand] [rpcParam]')
	.description('execute the given remote rpcCommand')
	.action(function(cmdProtoFile, cmdHostPort, cmdRpcCommand, cmdRpcParam) {
		protoFile = cmdProtoFile;
		hostPort = cmdHostPort;
		rpcService = _.dropRight((cmdRpcCommand || "").split('.'), 1).join('.');
		rpcCommand = _.last((cmdRpcCommand || "").split('.'));
		rpcParam = cmdRpcParam;
	})
	.option('-i, --interactive', 'Open an interactive prompt - Javascript REPL')
	.option('-x, --explore', 'Displays available full RPC command paths for the given proto file')
	.option('-u, --call-credentials <username> [password]', 'Username for call credentials')
	.option('-c, --channel-credentials <pemFile>', 'Key file (.pem) OpenSSL file for secure channel credentials')

program.parse(process.argv);


try {
	//try to load the file
	var protoDescriptor = grpc.load(path.resolve(process.cwd(), protoFile));
	//auto display some help if missing params
	if (!hostPort || !rpcCommand || program.explore) displayAvailableCommands(protoDescriptor);
	if (!hostPort || !rpcParam) displayAvailableParams(protoDescriptor);


} catch (e) {
	console.error("Unable to load protoFile: %s", protoFile || "");
	process.exit(1);
}

if (hostPort && rpcService && rpcCommand) {
	//check for the rpc Service
	try {
		var rpc = dot.pick(rpcService, protoDescriptor);
		if (rpc === undefined) throw new Error("undefined service");
		try {
			var client = new rpc(hostPort, grpc.credentials.createInsecure())

			//try to execute the command!
			try {
				client[rpcCommand](JSON.parse(rpcParam), function(err, response) {
					if (err) {
						console.error(err);
					}
					console.log(response);
				});
			} catch (e) {
				console.error("Command is undefined: %s", rpcCommand);
			}

		} catch (e) {
			console.error("Unable to connect to host: %s", hostPort);
		}

	} catch (e) {
		console.error("Service is undefined: %s", rpcCommand);
	}
}


//should i load the repl?
if (program.interactive) {
	//start and configure my custom repl
	replServer = repl.start({
		prompt: "grpc > "
	});

	//give access to certain variables in the repl
	replServer.context.grpc = grpc;
	replServer.context.proto = protoDescriptor;
	replServer.context.l = _;
	replServer.context.fs = fs;
	replServer.context.that = this;
}


function displayAvailableCommands(proto) {

	var commands = []
	_.forEach(proto, function(val, key, collection) {

		function dotPathFilter(dotPath, val, commands) {
			if (_.isPlainObject(val)) {
				_.forEach(val, (subVal, subKey) => {
					dotPathFilter(dotPath + "." + subKey, subVal, commands)
				})
			} else if (_.isFunction(val) && val.name === "Client") {
				_.forEach(val.service.children, (val) => {
					var callName = val.name.split("");
					callName[0] = callName[0].toLowerCase();
					commands.push(dotPath + "." + callName.join(""));

				})
			}
		}
		dotPathFilter(key, val, commands)

	});

	console.log(`
Avaialable Commands:

` + commands.join("\n"));

}


function displayAvailableParams(proto) {
	//TODO
}