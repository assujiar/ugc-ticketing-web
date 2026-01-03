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
import { Send, DollarSign, CheckCircle, Clock, MessageSquare, Loader2, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface TicketActionsProps {
  ticket: any;
  onUpdate: () => void;
}

const statusLabels: Record<string, string> = {
  open: "Open", need_response: "Need Response", in_progress: "In Progress",
  waiting_customer: "Waiting Customer", closed: "Closed",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-500/20 text-blue-400", need_response: "bg-orange-500/20 text-orange-400",
  in_progress: "bg-purple-500/20 text-purple-400", waiting_customer: "bg-yellow-500/20 text-yellow-400",
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
  const [profile, setProfile] = useState<any>(null);
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

  useEffect(() => {
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(data => {
        console.log("Profile from API:", data);
        if (data.success) setProfile(data.data);
      })
      .catch(err => console.error("Profile fetch error:", err));
  }, []);

  const profileDeptId = profile?.department_id;
  const roleName = profile?.roles?.name || "";
  const isSuperAdmin = roleName === "super_admin";
  const isCreator = ticket?.created_by === profile?.id;
  const isDepartmentStaff = profileDeptId && ticket?.department_id === profileDeptId;
  const canRespond = isDepartmentStaff || isSuperAdmin;
  const canClose = isCreator || isSuperAdmin;
  const isRFQ = ticket?.ticket_type === "RFQ";

  const handleSubmitComment = async () => {
    if (!comment.trim()) { toast.error("Please enter a message"); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: comment, type: "comment" }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Comment submitted!");
      setComment("");
      onUpdate();
      (window as any).refreshComments?.();
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmitQuote = async () => {
    if (!quotedPrice) { toast.error("Please enter price"); return; }
    setIsSubmitting(true);
    try {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + parseInt(quoteValidDays));
      const res = await fetch(`/api/tickets/${ticket.id}/quotes`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(quotedPrice), currency: "IDR", valid_until: validUntil.toISOString().split("T")[0], terms: quoteTerms || null }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success("Quote submitted!");
      setQuotedPrice(""); setQuoteTerms(""); setShowQuoteDialog(false);
      onUpdate();
      (window as any).refreshComments?.();
    } catch (e: any) { toast.error(e.message); }
    finally { setIsSubmitting(false); }
  };

  const handleWon = async () => {
    if (!projectDate) { toast.error("Please select date"); return; }
    setIsSubmitting(true);
    try {
      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: `✅ TICKET WON\nEstimasi Project: ${projectDate}${wonNotes ? `\nKeterangan: ${wonNotes}` : ""}`, type: "status_change", metadata: { resolution: "won", project_date: projectDate } }),
      });
      await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed", close_outcome: "won", closed_at: new Date().toISOString() }),
      });
      toast.success("Ticket Won!");
      setShowWonDialog(false); setProjectDate(""); setWonNotes("");
      onUpdate();
    } catch { toast.error("Failed"); }
    finally { setIsSubmitting(false); }
  };

  const handleLost = async () => {
    if (!lostReason) { toast.error("Select reason"); return; }
    setIsSubmitting(true);
    try {
      const label = lostReasons.find(r => r.value === lostReason)?.label || lostReason;
      let content = `❌ TICKET LOST\nAlasan: ${label}`;
      if (competitorPrice) content += `\nHarga kompetitor: Rp ${parseInt(competitorPrice).toLocaleString("id-ID")}`;
      if (lostNotes) content += `\nKeterangan: ${lostNotes}`;
      await fetch(`/api/tickets/${ticket.id}/comments`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type: "status_change", metadata: { resolution: "lost", reason: lostReason } }),
      });
      await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "closed", close_outcome: "lost", close_reason: lostReason, closed_at: new Date().toISOString() }),
      });
      toast.success("Ticket Lost");
      setShowLostDialog(false); setLostReason(""); setLostNotes(""); setCompetitorPrice("");
      onUpdate();
    } catch { toast.error("Failed"); }
    finally { setIsSubmitting(false); }
  };

  if (ticket?.status === "closed") {
    return (
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-lg flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-400" />Ticket Closed</CardTitle></CardHeader>
        <CardContent>
          <Badge className={ticket.close_outcome === "won" ? "bg-green-500/20 text-green-400" : ticket.close_outcome === "lost" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}>
            {ticket.close_outcome === "won" ? "Won ✓" : ticket.close_outcome === "lost" ? "Lost ✗" : "Resolved"}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5" />Actions</CardTitle>
        <CardDescription>Respond or update ticket status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Add Comment</Label>
          <Textarea placeholder="Write your message..." value={comment} onChange={(e) => setComment(e.target.value)} className="bg-white/5 border-white/10 min-h-[100px]" />
          <Button onClick={handleSubmitComment} disabled={isSubmitting || !comment.trim()} className="w-full bg-blue-600 hover:bg-blue-700">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}Send Comment
          </Button>
        </div>

        {canRespond && isRFQ && (
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild><Button className="w-full bg-green-600 hover:bg-green-700"><DollarSign className="h-4 w-4 mr-2" />Submit Quote</Button></DialogTrigger>
            <DialogContent className="bg-slate-900 border-white/10">
              <DialogHeader><DialogTitle>Submit Quote</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Price (IDR) *</Label><Input type="number" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} className="bg-white/5 border-white/10" /></div>
                <div><Label>Valid (Days)</Label>
                  <Select value={quoteValidDays} onValueChange={setQuoteValidDays}><SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10"><SelectItem value="7">7 days</SelectItem><SelectItem value="14">14 days</SelectItem><SelectItem value="30">30 days</SelectItem></SelectContent>
                  </Select>
                </div>
                <div><Label>Terms</Label><Textarea value={quoteTerms} onChange={(e) => setQuoteTerms(e.target.value)} className="bg-white/5 border-white/10" /></div>
              </div>
              <DialogFooter><Button variant="outline" onClick={() => setShowQuoteDialog(false)}>Cancel</Button><Button onClick={handleSubmitQuote} disabled={isSubmitting || !quotedPrice} className="bg-green-600">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Submit</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {canClose && isRFQ && (
          <div className="grid grid-cols-2 gap-2">
            <Dialog open={showWonDialog} onOpenChange={setShowWonDialog}>
              <DialogTrigger asChild><Button className="bg-green-600 hover:bg-green-700"><ThumbsUp className="h-4 w-4 mr-2" />Won</Button></DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader><DialogTitle>Mark as Won</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Project Date *</Label><Input type="date" value={projectDate} onChange={(e) => setProjectDate(e.target.value)} className="bg-white/5 border-white/10" /></div>
                  <div><Label>Notes</Label><Textarea value={wonNotes} onChange={(e) => setWonNotes(e.target.value)} className="bg-white/5 border-white/10" /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowWonDialog(false)}>Cancel</Button><Button onClick={handleWon} disabled={isSubmitting || !projectDate} className="bg-green-600">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Confirm</Button></DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={showLostDialog} onOpenChange={setShowLostDialog}>
              <DialogTrigger asChild><Button variant="outline" className="border-red-500/30 text-red-400"><ThumbsDown className="h-4 w-4 mr-2" />Lost</Button></DialogTrigger>
              <DialogContent className="bg-slate-900 border-white/10">
                <DialogHeader><DialogTitle>Mark as Lost</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div><Label>Reason *</Label>
                    <Select value={lostReason} onValueChange={setLostReason}><SelectTrigger className="bg-white/5 border-white/10"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10">{lostReasons.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  {lostReason === "price_not_competitive" && <div><Label>Competitor Price</Label><Input type="number" value={competitorPrice} onChange={(e) => setCompetitorPrice(e.target.value)} className="bg-white/5 border-white/10" /></div>}
                  <div><Label>Notes</Label><Textarea value={lostNotes} onChange={(e) => setLostNotes(e.target.value)} className="bg-white/5 border-white/10" /></div>
                </div>
                <DialogFooter><Button variant="outline" onClick={() => setShowLostDialog(false)}>Cancel</Button><Button onClick={handleLost} disabled={isSubmitting || !lostReason} variant="destructive">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Confirm</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {canClose && !isRFQ && (
          <Button onClick={async () => { setIsSubmitting(true); await fetch(`/api/tickets/${ticket.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "closed" }) }); toast.success("Closed!"); onUpdate(); setIsSubmitting(false); }} disabled={isSubmitting} variant="outline" className="w-full border-green-500/30 text-green-400">
            <CheckCircle className="h-4 w-4 mr-2" />Close
          </Button>
        )}

        <div className="pt-4 border-t border-white/10">
          <Badge className={statusColors[ticket?.status] || statusColors.open}>{statusLabels[ticket?.status] || ticket?.status}</Badge>
          <p className="text-xs text-white/30 mt-2">canRespond: {String(canRespond)} | myDept: {profileDeptId || "null"} | ticketDept: {ticket?.department_id}</p>
        </div>
      </CardContent>
    </Card>
  );
}
