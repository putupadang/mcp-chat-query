"use client";

import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Wrench, Clock } from "lucide-react";

interface ToolCallProps {
  toolCall: {
    name: string;
    input: any;
    result: any;
    executionTime?: string;
  };
}

export default function ToolCall({ toolCall }: ToolCallProps) {
  return (
    <Card className="w-full bg-accent/50 border-accent">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Tool: {toolCall.name}
          {toolCall.executionTime && (
            <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground font-normal">
              <Clock className="h-3 w-3" />
              {toolCall.executionTime}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Input:
          </p>
          <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
            {JSON.stringify(toolCall.input, null, 2)}
          </pre>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">
            Result:
          </p>
          <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto max-h-40 overflow-y-auto">
            {JSON.stringify(toolCall.result, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}
