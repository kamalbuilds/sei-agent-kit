import { SeiAgentKit } from "../src";
import { createSeiTools } from "../src/langchain";
import { HumanMessage } from "@langchain/core/messages";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import * as dotenv from "dotenv";
import { sleep } from "openai/core";
import * as readline from "readline";

dotenv.config();

function checkRequiredEnvVars(): void {
  const missingVars: string[] = [];
  const requiredVars = ["OPENAI_API_KEY", "SEI_PRIVATE_KEY", "RPC_URL"];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      console.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    process.exit(1);
  }
}

async function setupAgent() {
  try {
    const llm = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.1,
    });

    const agentInstance = new SeiAgentKit(
      process.env.SEI_PRIVATE_KEY!,
      {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
      },
    );
    const agentTools = createSeiTools(agentInstance);

    const memory = new MemorySaver();
    const agentConfig = { configurable: { thread_id: "Sei Agent Kit!" } };

    const agent = createReactAgent({
      llm,
      tools: agentTools,
      checkpointSaver: memory,
      messageModifier: `
        You are a helpful agent that can interact onchain using the Sei Agent Kit. You are
        empowered to interact onchain using your tools. If you ever need funds, you can request them from the
        faucet.  If not, you can provide your wallet details and request funds from the user. If there is a 5XX
        (internal) HTTP error code, ask the user to try again later. All users wallet infos are already provided on the tool kit. If someone asks you to do something you
        can't do with your currently available tools, you must say so, and encourage them to implement it
        themselves using the Sei Agent Kit, recommend they go to the twitter account https://x.com/cambrian_ai for more information. Be
        concise and helpful with your responses. Refrain from restating your tools' descriptions unless it is explicitly requested.
        If the user tries to exit the conversation, just tell them that by typing "bye" they can end the conversation.
      `,
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.error("Failed to initialize agent:", error);
    throw error;
  }
}

async function startInteractiveSession(agent: any, config: any) {
  await sleep(1000);
  console.log("\nStarting chat with the Cambrian Agent... Type 'bye' to end.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> =>
    new Promise((resolve) => rl.question(prompt, resolve));

  try {
    while (true) {
      const userInput = await question("\nYou: ");

      if (userInput.toLowerCase() === "bye") {
        break;
      }

      const responseStream = await agent.stream(
        { messages: [new HumanMessage(userInput)] },
        config,
      );

      for await (const responseChunk of responseStream) {
        if ("agent" in responseChunk) {
          console.log("\nCambrian Agent:", responseChunk.agent.messages[0].content);
        } else if ("tools" in responseChunk) {
          console.log("\nCambrian Agent:", responseChunk.tools.messages[0].content);
        }
        console.log("\n-----------------------------------\n");
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  try {
    console.log('\x1b[38;2;201;235;52m%s\x1b[0m', `
  ███████╗███████╗██╗      █████╗  ██████╗ ███████╗███╗   ██╗████████╗    ██╗  ██╗██╗████████╗
  ██╔════╝██╔════╝██║     ██╔══██╗██╔════╝ ██╔════╝████╗  ██║╚══██╔══╝    ██║ ██╔╝██║╚══██╔══╝
  ███████╗█████╗  ██║     ███████║██║  ███╗█████╗  ██╔██╗ ██║   ██║       █████╔╝ ██║   ██║   
  ╚════██║██╔══╝  ██║     ██╔══██║██║   ██║██╔══╝  ██║╚██╗██║   ██║       ██╔═██╗ ██║   ██║   
  ███████║███████╗██║     ██║  ██║╚██████╔╝███████╗██║ ╚████║   ██║       ██║  ██╗██║   ██║   
  ╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═══╝   ╚═╝       ╚═╝  ╚═╝╚═╝   ╚═╝   
`);
    const { agent, config } = await setupAgent();
    await startInteractiveSession(agent, config);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error:", error.message);
    }
    process.exit(1);
  }
}

export { setupAgent, startInteractiveSession };

if (require.main === module) {
  checkRequiredEnvVars();
  main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
}
