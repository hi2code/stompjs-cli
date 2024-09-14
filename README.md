# stompjs-cli

stompjs-cli is an interactive command-line client for stomp protocol.

## Installation


```bash
npm install -g stompjs-cli
pnpm install -g stompjs-cli
```

## Usage

```bash
# stompjs-cli <brokerURL>
stompjs-cli ws://localhost:8080/foo

## Subscribe to a destination
stompjs-cli> sub /topic/bar
Subscribed to /topic/bar

## Publish a message to a destination
stompjs-cli> pub /topic/greetings hello
Published to /topic/greetings: hello

## When receive message
stompjs-cli> Received on /topic/greetings: hello
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

Apache-2.0