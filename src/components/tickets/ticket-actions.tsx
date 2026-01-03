"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Send, DollarSign, CheckCircle, Clock, MessageSquare, Loader2, ThumbsUp, ThumbsDown, Calendar } from "lucide-react";
import { useCurrentUser } from "@/hooks/useAuth";
import { toast } from "sonner";

interface TicketActionsProps {
  ticket: any;
  onUpdate: () => void;
}

const statusLabels: Record<string, string> = {
  open: "Open",
  need_response: "Need Response",
  in_progress: "In Progress",
  waiting_customer: "Waiting Customer",
  closed: "Closed",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400",
  need_response: "bg-orange-500/20 text-orange-400",
  in_progress: "bg-purple-500/20 text-purple-400",
  waiting_customer: "bg-yellow-500/20 text-yellow-400",
  closed: "bg-gray-500/20 text-gray-400",
};

const lostReasons = [
  { value: "price_not_competitive", label: "Harga tidak kompetitif" },
  { value: "customer_cancel", label: "Customer membatalkan" },
  { value: "competitor_won", label: "Kompetitor menang" },
  { value: "service_not_match", label: "Layanan tidak sesuai kebutuhan" },
  { value: "timing_issue", label: "Waktu tidak sesuai" },
  { value: "other", label: "Lainnya" },
];

export function TicketActions({ ticket, onUpdate }: TicketActionsProps) {
  const { profile } = useCurrentUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [quoteTerms, setQuoteTerms] = useState("");
  const [quoteValidDays, setQuoteValidDays] = useState("7");
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [showWonDialog, setShowWonDialog] = useState(false);
  const [showLostDialog, setShowLostDialog] = useState(false);

  const [projectDate, setProjectDate] = useState("");
  const [wonNotes, setWonNotes] = useState("");

  const [lostReason, setLostReason] = useState("");
  const [lostNotes, setLostNotes] = useState("");
  const [competitorPrice, setCompetitorPrice] = useState("");

  // Get department ID - check both direct field and relation
  const profileDeptId = profile?.department_id || (profile?.departments as any)?.id || null;
  
  const isCreator = ticket?.created_by === profile?.id;
  const isDepartmentStaff = profileDeptId !== null && ticket?.department_id === profileDeptId;
  const isSuperAdmin = profile?.roles?.name === "super_admin";
  const isManager = profile?.roles?.name?.includes("manager") || false;
  
  // Department can respond if they are from the same department OR super admin
  const canRespond = isDepartmentStaff || isSuperAdmin;
  // Creator can close ticket
  const canClose = isCreator || isSuperAdmin;
  const isRFQ = ticket?.ticket_type === "RFQ";

  // Debug logging
  useEffect(() => {
    console.log("TicketActions Debug:", {
      ticketId: ticket?.id,
      ticketDeptId: ticket?.department_id,
      profileId: profile?.id,
      profileDeptId: profileDeptId,
      profileDeptDirect: profile?.department_id,
      profileDeptRelation: (profile?.departments as any)?.id,
      profileRole: profile?.roles?.name,
      createdBy: ticket?.created_by,
      ticketType: ticket?.ticket_type,
      canRespond,
      isDepartmentStaff,
    });
  }, [ticket, profile, profileDeptId, canRespond, isDepartmentStaff]);

  const handleSubmitComment = async () => {
    if (!comment.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, type: "comment" }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to submit");
      }

      toast.success("Comment submitted!");
      setComment("");
      onUpdate();
      
      if ((window as any).refreshComments) {
        (window as any).refreshComments();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitQuote = async () => {
    if (!quotedPrice) {
      toast.error("Please enter quoted price");
      return;
    }

    setIsSubmitting(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(quoteValidDays || "7"));

      const response = await fetch(`/api/tickets/${ticket.id}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(quotedPrice),
          currency: "IDR",
          valid_until: validUntil.toISOString().split("T")[0],
          terms: quoteTerms || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to submit quote");
      }

      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: quoteTerms || `Quote submitted: IDR ${parseInt(quotedPrice).toLocaleString("id-ID")}`,
          type: "quote",
        }),
      });

      toast.success("Quote submitted!");
      setQuotedPrice("");
      setQuoteTerms("");
      setShowQuoteDialog(false);
      onUpdate();
      
      if ((window as any).refreshComments) {
        (window as any).refreshComments();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit quote");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWon = async () => {
    if (!projectDate) {
      toast.error("Please select project date");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `✅ TICKET WON\n\nEstimasi Project: ${projectDate}\n${wonNotes ? `\nKeterangan: ${wonNotes}` : ""}`,
          type: "status_change",
          metadata: {
            resolution: "won",
            project_date: projectDate,
            notes: wonNotes,
          },
        }),
      });

      await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          close_outcome: "won",
          closed_at: new Date().toISOString(),
          metadata: {
            ...ticket.metadata,
            project_date: projectDate,
            won_notes: wonNotes,
          },
        }),
      });

      toast.success("Ticket marked as Won!");
      setShowWonDialog(false);
      setProjectDate("");
      setWonNotes("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLost = async () => {
    if (!lostReason) {
      toast.error("Please select reason");
      return;
    }

    setIsSubmitting(true);
    try {
      const reasonLabel = lostReasons.find((r) => r.value === lostReason)?.label || lostReason;
      let commentContent = `❌ TICKET LOST\n\nAlasan: ${reasonLabel}`;

      if (lostReason === "price_not_competitive" && competitorPrice) {
        commentContent += `\nHarga kompetitor: Rp ${parseInt(competitorPrice).toLocaleString("id-ID")}`;
      }

      if (lostNotes) {
        commentContent += `\n\nKeterangan: ${lostNotes}`;
      }

      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: commentContent,
          type: "status_change",
          metadata: {
            resolution: "lost",
            reason: lostReason,
            reason_label: reasonLabel,
            competitor_price: competitorPrice ? parseFloat(competitorPrice) : null,
            notes: lostNotes,
          },
        }),
      });

      await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          close_outcome: "lost",
          close_reason: lostReason,
          closed_at: new Date().toISOString(),
          metadata: {
            ...ticket.metadata,
            lost_reason: lostReason,
            lost_reason_label: reasonLabel,
            competitor_price: competitorPrice ? parseFloat(competitorPrice) : null,
            lost_notes: lostNotes,
          },
        }),
      });

      toast.success("Ticket marked as Lost");
      setShowLostDialog(false);
      setLostReason("");
      setLostNotes("");
      setCompetitorPrice("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaitingCustomer = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: comment || "Menunggu konfirmasi dari customer terkait quotation.",
          type: "waiting_customer",
        }),
      });

      toast.success("Status updated to Waiting Customer");
      setComment("");
      onUpdate();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseResolved = async () => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "closed",
          closed_at: new Date().toISOString(),
        }),
      });

      toast.success("Ticket closed!");
      onUpdate();
    } catch (error) {
      toast.error("Failed to close ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (ticket?.status === "closed") {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            Ticket Closed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-sm">Resolution:</span>
              <Badge
                className={`${
                  ticket.close_outcome === "won"
                    ? "bg-green-500/20 text-green-400"
                    : ticket.close_outcome === "lost"
                    ? "bg-red-500/20 text-red-400"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {ticket.close_outcome === "won" 
                  ? "Won ✓" 
                  : ticket.close_outcome === "lost"
                  ? "Lost ✗" 
                  : "Resolved"}
              </Badge>
            </div>
            {ticket.metadata?.project_date && (
              <p className="text-sm text-white/60">
                <Calendar className="h-4 w-4 inline mr-1" />
                Project Date: {ticket.metadata.project_date}
              </p>
            )}
            {ticket.metadata?.lost_reason_label && (
              <p className="text-sm text-white/60">Reason: {ticket.metadata.lost_reason_label}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Actions
        </CardTitle>
        <CardDescription>Respond or update ticket status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment Section */}
        <div className="space-y-2">
          <Label>Add Comment</Label>
          <Textarea
            placeholder="Write your message..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="bg-white/5 border-white/10 min-h-[100px]"
          />
          <Button
            onClick={handleSubmitComment}
            disabled={isSubmitting || !comment.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
            Send Comment
          </Button>
        </div>

        {/* Submit Quote - Department staff or admin */}
        {canRespond && isRFQ && (
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-green-600 hover:bg-green-700">
                <DollarSign className="h-4 w-4 mr-2" />
                Submit Quote / Rate
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10">
              <DialogHeader>
                <DialogTitle>Submit Quote</DialogTitle>
                <DialogDescription>Provide pricing for this rate inquiry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Quoted Price (IDR) *</Label>
                  <Input
                    type="number"
                    placeholder="Enter price..."
                    value={quotedPrice}
                    onChange={(e) => setQuotedPrice(e.target.value)}
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid For (Days)</Label>
                  <Select value={quoteValidDays} onValueChange={setQuoteValidDays}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10">
                      <SelectItem value="3">3 days</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Terms & Notes</Label>
                  <Textarea
                    placeholder="Additional terms, conditions, or notes..."
                    value={quoteTerms}
                    onChange={(e) => setQuoteTerms(e.target.value)}
                    className="bg-white/5 border-white/10 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowQuoteDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitQuote}
                  disabled={isSubmitting || !quotedPrice}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Submit Quote
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Waiting Customer */}
        {isCreator && isRFQ && ticket?.status === "need_response" && (
          <Button
            onClick={handleWaitingCustomer}
            disabled={isSubmitting}
            variant="outline"
            className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Clock className="h-4 w-4 mr-2" />
            Waiting Customer Response
          </Button>
        )}

        {/* Won/Lost - Creator can close RFQ tickets */}
        {canClose && isRFQ && (
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={showWonDialog} onOpenChange={setShowWonDialog}>
              <DialogTrigger asChild>
                <Button className="bg-green-600 hover:bg-green-700">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Won
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    Mark as Won
                  </DialogTitle>
                  <DialogDescription>Quote diterima customer. Kapan project akan dilaksanakan?</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Estimasi Tanggal Project *</Label>
                    <Input
                      type="date"
                      value={projectDate}
                      onChange={(e) => setProjectDate(e.target.value)}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Keterangan Tambahan</Label>
                    <Textarea
                      placeholder="Detail project, PIC customer, dll..."
                      value={wonNotes}
                      onChange={(e) => setWonNotes(e.target.value)}
                      className="bg-white/5 border-white/10 min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowWonDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleWon} disabled={isSubmitting || !projectDate} className="bg-green-600 hover:bg-green-700">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirm Won
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-red-500/30 text-red-400 hover:bg-red-500/10">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Lost
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ThumbsDown className="h-5 w-5 text-red-400" />
                    Mark as Lost
                  </DialogTitle>
                  <DialogDescription>Quote tidak diterima. Mohon berikan alasan.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Alasan Lost *</Label>
                    <Select value={lostReason} onValueChange={setLostReason}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Pilih alasan..." />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">
                        {lostReasons.map((reason) => (
                          <SelectItem key={reason.value} value={reason.value}>
                            {reason.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {lostReason === "price_not_competitive" && (
                    <div className="space-y-2">
                      <Label>Harga Kompetitor (IDR)</Label>
                      <Input
                        type="number"
                        placeholder="Masukkan harga kompetitor..."
                        value={competitorPrice}
                        onChange={(e) => setCompetitorPrice(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                      <p className="text-xs text-white/40">Optional: Harga yang ditawarkan kompetitor</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Keterangan Tambahan</Label>
                    <Textarea
                      placeholder="Detail tambahan..."
                      value={lostNotes}
                      onChange={(e) => setLostNotes(e.target.value)}
                      className="bg-white/5 border-white/10 min-h-[80px]"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowLostDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLost} disabled={isSubmitting || !lostReason} variant="destructive">
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Confirm Lost
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Close as Resolved - For non-RFQ tickets */}
        {canClose && !isRFQ && (
          <Button
            onClick={handleCloseResolved}
            disabled={isSubmitting}
            variant="outline"
            className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Close as Resolved
          </Button>
        )}

        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-white/40 mb-2">Current Status</p>
          <Badge className={statusColors[ticket?.status] || statusColors.open}>
            {statusLabels[ticket?.status] || ticket?.status}
          </Badge>
          
          {/* Debug info */}
          <div className="mt-4 p-2 bg-white/5 rounded text-xs text-white/40">
            <p>Debug: canRespond={String(canRespond)}, isDeptStaff={String(isDepartmentStaff)}</p>
            <p>Profile dept: {profileDeptId || "(none)"}</p>
            <p>Ticket dept: {ticket?.department_id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
