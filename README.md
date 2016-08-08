GRPC-Client
===================


With `grpc-cli` you can do the following:

 - execute grpc commands
 - explore namespaces and grpc services
 - use an interactive prompt (Javascript REPL) for advanced usage

###Quick Example

    >grpc-cli helloworld.proto localhost:50051 helloworld.Greeter.SayHello "{\"name\":\"World\"}"
    {message: "Hello World"}
    



Installation
------------
 1. install nodejs: [nodejs.org](https://nodejs.org/en/)
 2. install the grpc-client module:

        npm install -g grpc-cli



Usage
----------

    > grpc-cli [options] <protoFile> [hostPort] [rpcCommand] [rpcParam]

###Arguments

 - `protoFile` - required - filepath to the .proto file that will be used
 - `hostPort` - optional - the host and port for the GRPC server
 - `rpcCommand` - optional - the RPC command that will be executed, given the full namespace, use the `-x` option to see all available `rpcCommand`'s
 - `rpcParam` - optional - the serialized json representation of the `rpcCommand`'s parameter

###Options

    -h, --help                                    give help information
    -V, --version                                 output the version number
    -i, --interactive                             Open an interactive prompt - Javascript REPL
    -x, --explore                                 Displays available full RPC command paths for the given proto file
    -u, --call-credentials <username> [password]  Username for call credentials
    -c, --channel-credentials <pemFile>           Key file (.pem) OpenSSL file for secure channel credentials


###Not Implemented (yet)

 - Channel Credentials 
 - Call Credintials
 - Streaming Inputs and/or outputs

###Contact
Daniel Myers damyers2@cisco.com

