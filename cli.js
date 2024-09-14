const { Command } = require("commander");
const { Client } = require("@stomp/stompjs");
const readline = require("readline");
const { WebSocket } = require("ws");

Object.assign(global, { WebSocket });

const program = new Command();

program
  .version("0.0.1")
  .description("Interactive CLI for STOMP server")
  .argument("<brokerURL>", "STOMP server host (ws:// or wss://)");

program.parse(process.argv);

const brokerURL = program.args[0];

const client = new Client({
  brokerURL: brokerURL,
  onConnect: () => {
    console.log("Connected to the STOMP server.", brokerURL);
    showPrompt();
  },
  onStompError: (frame) => {
    console.error("Broker error: ", frame.headers["message"]);
    console.error("Additional details: ", frame.body);
  },
  onWebSocketClose: () => {
    console.log("WebSocket is closed.");
  },
});

client.activate();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: "stompjs-cli> ",
});

let subscriptions = {};

function showPrompt() {
  console.log(`
Available commands:
  sub <destination>             - Subscribe to a destination, example 'sub /topic/bar'
  pub <destination> <message>   - Publish a message to a destination, example 'pub /topic/bar hello'
  list                          - List current subscriptions
  exit                          - Exit the CLI
  `);
  rl.prompt();
}

rl.on("line", (line) => {
  const input = line.trim().split(" ");
  const command = input[0];

  switch (command) {
    case "sub": {
      const destination = input[1];
      if (!destination) {
        console.log("Error: Missing destination.");
        break;
      }
      if (subscriptions[destination]) {
        console.log(`Already subscribed to ${destination}.`);
        break;
      }
      subscriptions[destination] = client.subscribe(destination, (message) => {
        console.log(`Received on ${destination}:`, message.body);
        rl.prompt();
      });
      console.log(`Subscribed to ${destination}.`);
      break;
    }

    case "pub": {
      const destination = input[1];
      const message = input.slice(2).join(" ");
      if (!destination ) {
        console.log("Error: Missing destination");
        break;
      }
      if (!message){
        console.log("Error: Missing message.");
        break;
      }
      try {
        let messageBody;
        try {
          messageBody = JSON.stringify(JSON.parse(message));
        } catch (error) {
          messageBody = message;
        }
        client.publish({ destination: destination, body: messageBody });
        console.log(`Published to ${destination}: ${messageBody}`);
      } catch (error) {
        console.log("Error: Invalid JSON format.");
      }
      break;
    }

    case "list": {
      console.log("Current subscriptions:");
      Object.keys(subscriptions).forEach((destination) => {
        console.log(`  - ${destination}`);
      });
      break;
    }

    case "exit": {
      console.log("Exiting...");
      Object.values(subscriptions).forEach((sub) => sub.unsubscribe());
      client.deactivate();
      rl.close();
      break;
    }

    default:
      console.log("Unknown command:", command);
      break;
  }

  rl.prompt();
}).on("close", () => {
  console.log("CLI closed.");
  process.exit(0);
});
