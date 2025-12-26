"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RFQForm } from "./rfq-form";
import { GenForm } from "./gen-form";
import { FileQuestion, FileText } from "lucide-react";

export function CreateTicketForm() {
  const [ticketType, setTicketType] = useState<"RFQ" | "GEN">("RFQ");

  return (
    <Card className="glass-card max-w-4xl mx-auto">
      <CardContent className="p-6">
        <Tabs
          value={ticketType}
          onValueChange={(v) => setTicketType(v as "RFQ" | "GEN")}
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="RFQ" className="gap-2">
              <FileQuestion className="h-4 w-4" />
              Rate Inquiry (RFQ)
            </TabsTrigger>
            <TabsTrigger value="GEN" className="gap-2">
              <FileText className="h-4 w-4" />
              General Request
            </TabsTrigger>
          </TabsList>

          <TabsContent value="RFQ">
            <RFQForm />
          </TabsContent>

          <TabsContent value="GEN">
            <GenForm />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}