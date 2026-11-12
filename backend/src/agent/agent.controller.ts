import { Body, Controller, Get, Post } from "@nestjs/common";
import { z } from "zod";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AgentService } from "./agent.service";

const toolCallSchema = z.object({
  tool: z.string().min(1),
  params: z.record(z.unknown()).default({}),
});

const mcpRequestSchema = z.object({
  jsonrpc: z.literal("2.0").default("2.0"),
  id: z.union([z.string(), z.number()]).optional(),
  method: z.string().min(1),
  params: z.record(z.unknown()).optional(),
});

@Controller("agent")
export class AgentController {
  constructor(private readonly agent: AgentService) {}

  @Get()
  getManifest() {
    return this.agent.manifest();
  }

  @Get("mcp")
  getMcpManifest() {
    return this.agent.mcpManifest();
  }

  @Post()
  async execute(@Body(new ZodValidationPipe(toolCallSchema)) body: z.infer<typeof toolCallSchema>) {
    const result = await this.agent.callTool(body.tool, body.params);
    return { success: true, tool: body.tool, result };
  }

  @Post("mcp")
  async mcp(
    @Body(new ZodValidationPipe(mcpRequestSchema)) body: z.infer<typeof mcpRequestSchema>
  ) {
    const respond = (result: unknown) => ({ jsonrpc: "2.0", id: body.id ?? null, result });

    if (body.method === "initialize") {
      return respond({
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: this.agent.mcpManifest().serverInfo,
      });
    }

    if (body.method === "tools/list") {
      return respond({ tools: this.agent.mcpManifest().tools });
    }

    if (body.method === "tools/call") {
      const params = body.params ?? {};
      const name = String(params.name ?? "");
      const args = (params.arguments ?? {}) as Record<string, unknown>;
      const result = await this.agent.callTool(name, args);
      return respond({
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    }

    return {
      jsonrpc: "2.0",
      id: body.id ?? null,
      error: { code: -32601, message: `Unknown method: ${body.method}` },
    };
  }
}
