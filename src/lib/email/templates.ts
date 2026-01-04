// Base styles for all email templates
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
  .wrapper { background: #f5f5f5; padding: 40px 20px; }
  .container { max-width: 600px; margin: 0 auto; }
  .header { background: linear-gradient(135deg, #0a1628 0%, #132744 100%); padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
  .header h1 { color: #f97316; margin: 0; font-size: 24px; }
  .header p { color: #94a3b8; margin: 10px 0 0; font-size: 14px; }
  .content { background: #ffffff; padding: 30px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; }
  .ticket-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
  .ticket-code { font-family: monospace; font-size: 20px; font-weight: bold; color: #f97316; }
  .label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .value { font-size: 14px; color: #1e293b; margin-bottom: 16px; }
  .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .badge-rfq { background: #dbeafe; color: #1d4ed8; }
  .badge-gen { background: #f3e8ff; color: #7c3aed; }
  .badge-low { background: #dcfce7; color: #166534; }
  .badge-medium { background: #fef9c3; color: #854d0e; }
  .badge-high { background: #fed7aa; color: #c2410c; }
  .badge-urgent { background: #fee2e2; color: #dc2626; }
  .btn { display: inline-block; background: #f97316; color: white !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px; }
  .btn:hover { background: #ea580c; }
  .btn-outline { background: transparent; border: 2px solid #f97316; color: #f97316 !important; }
  .footer { background: #f8fafc; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; border: 1px solid #e2e8f0; border-top: none; }
  .footer p { color: #64748b; font-size: 12px; margin: 0; }
  .divider { height: 1px; background: #e2e8f0; margin: 16px 0; }
  .grid { display: table; width: 100%; }
  .grid-col { display: table-cell; width: 50%; vertical-align: top; }
  .alert { padding: 12px 16px; border-radius: 8px; margin: 16px 0; }
  .alert-warning { background: #fef3c7; border: 1px solid #f59e0b; color: #92400e; }
  .alert-danger { background: #fee2e2; border: 1px solid #ef4444; color: #991b1b; }
  .alert-success { background: #dcfce7; border: 1px solid #22c55e; color: #166534; }
  .alert-info { background: #dbeafe; border: 1px solid #3b82f6; color: #1e40af; }
  .text-muted { color: #64748b; font-size: 13px; }
  .text-center { text-align: center; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
`;

export interface TicketEmailData {
  ticketCode: string;
  ticketType: string;
  subject: string;
  description?: string;
  priority: string;
  departmentName: string;
  creatorName: string;
  creatorEmail: string;
  customerName?: string;
  serviceType?: string;
  origin?: string;
  destination?: string;
  ticketUrl: string;
}

function getPriorityBadge(priority: string): string {
  const classes: Record<string, string> = {
    urgent: "badge-urgent", high: "badge-high", medium: "badge-medium", low: "badge-low"
  };
  return `<span class="badge ${classes[priority] || 'badge-medium'}">${priority.toUpperCase()}</span>`;
}

function getTypeBadge(type: string): string {
  return `<span class="badge ${type === 'RFQ' ? 'badge-rfq' : 'badge-gen'}">${type === 'RFQ' ? 'Rate Inquiry' : 'General Request'}</span>`;
}

// ==================== TICKET CREATED ====================

export function ticketCreatedForCreator(data: TicketEmailData): string {
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>🎫 Ticket Created Successfully</h1>
    <p>Your request has been submitted</p>
  </div>
  <div class="content">
    <p>Hi <strong>${data.creatorName}</strong>,</p>
    <p>Your ticket has been created and assigned to <strong>${data.departmentName}</strong>. Our team will review and respond shortly.</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="grid">
        <div class="grid-col"><div class="label">Type</div><div class="value">${getTypeBadge(data.ticketType)}</div></div>
        <div class="grid-col"><div class="label">Priority</div><div class="value">${getPriorityBadge(data.priority)}</div></div>
      </div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      ${data.serviceType ? `<div class="label">Service</div><div class="value">${data.serviceType}</div>` : ''}
      ${data.origin && data.destination ? `<div class="label">Route</div><div class="value">${data.origin} → ${data.destination}</div>` : ''}
    </div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn">View Ticket Details</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

export function ticketCreatedForDepartment(data: TicketEmailData): string {
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>🔔 New Ticket Assigned</h1>
    <p>Action required from your department</p>
  </div>
  <div class="content">
    <p>Hello <strong>${data.departmentName}</strong> Team,</p>
    <p>A new ticket has been assigned to your department and requires attention.</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="grid">
        <div class="grid-col"><div class="label">Type</div><div class="value">${getTypeBadge(data.ticketType)}</div></div>
        <div class="grid-col"><div class="label">Priority</div><div class="value">${getPriorityBadge(data.priority)}</div></div>
      </div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      <div class="label">Submitted By</div>
      <div class="value">${data.creatorName} (${data.creatorEmail})</div>
      ${data.serviceType ? `<div class="label">Service</div><div class="value">${data.serviceType}</div>` : ''}
      ${data.origin && data.destination ? `<div class="label">Route</div><div class="value">${data.origin} → ${data.destination}</div>` : ''}
    </div>
    
    <div class="alert alert-warning">⏰ Please respond within SLA timeframe to maintain service quality.</div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn">View & Respond</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

export function ticketCreatedForManager(data: TicketEmailData): string {
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>📊 New Ticket Alert</h1>
    <p>Manager notification</p>
  </div>
  <div class="content">
    <p>Hello Manager,</p>
    <p>A new ticket has been created in the system:</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="grid">
        <div class="grid-col"><div class="label">Type</div><div class="value">${getTypeBadge(data.ticketType)}</div></div>
        <div class="grid-col"><div class="label">Priority</div><div class="value">${getPriorityBadge(data.priority)}</div></div>
      </div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      <div class="label">Department</div>
      <div class="value">${data.departmentName}</div>
      <div class="label">Submitted By</div>
      <div class="value">${data.creatorName}</div>
    </div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn btn-outline">View Ticket</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

// ==================== TICKET RESPONSE ====================

export function ticketResponseNotification(data: {
  ticketCode: string;
  subject: string;
  responderName: string;
  responsePreview?: string;
  ticketUrl: string;
  recipientName: string;
}): string {
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>💬 New Response</h1>
    <p>Your ticket has been updated</p>
  </div>
  <div class="content">
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p><strong>${data.responderName}</strong> has responded to your ticket.</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      ${data.responsePreview ? `<div class="label">Response Preview</div><div class="value" style="background:#f1f5f9;padding:12px;border-radius:6px;font-style:italic;">"${data.responsePreview.substring(0, 200)}${data.responsePreview.length > 200 ? '...' : ''}"</div>` : ''}
    </div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn">View Full Response</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

// ==================== QUOTE SUBMITTED ====================

export function quoteSubmittedNotification(data: {
  ticketCode: string;
  subject: string;
  amount: number;
  currency: string;
  validUntil: string;
  ticketUrl: string;
  recipientName: string;
}): string {
  const formattedAmount = new Intl.NumberFormat("id-ID").format(data.amount);
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>💰 Quote Submitted</h1>
    <p>A price quote is ready for your review</p>
  </div>
  <div class="content">
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p>A price quote has been submitted for your rate inquiry.</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      <div class="label">Quoted Price</div>
      <div style="font-size:28px;font-weight:bold;color:#16a34a;margin:8px 0;">${data.currency} ${formattedAmount}</div>
      <div class="label">Valid Until</div>
      <div class="value">${data.validUntil}</div>
    </div>
    
    <div class="alert alert-info">💡 Please review the quote and respond to proceed with the request.</div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn">Review Quote</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

// ==================== TICKET CLOSED ====================

export function ticketClosedNotification(data: {
  ticketCode: string;
  subject: string;
  outcome: "won" | "lost" | "resolved";
  ticketUrl: string;
  recipientName: string;
}): string {
  const defaultConfig = { emoji: "✅", text: "RESOLVED", color: "#3b82f6", alertClass: "alert-info" };
  const outcomeConfig: Record<string, { emoji: string; text: string; color: string; alertClass: string }> = {
    won: { emoji: "🏆", text: "WON", color: "#16a34a", alertClass: "alert-success" },
    lost: { emoji: "❌", text: "LOST", color: "#dc2626", alertClass: "alert-danger" },
    resolved: defaultConfig,
  };
  const config = outcomeConfig[data.outcome] ?? defaultConfig;
  
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header">
    <h1>🏁 Ticket Closed</h1>
    <p>This ticket has been closed</p>
  </div>
  <div class="content">
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    <p>The following ticket has been closed:</p>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      <div class="label">Outcome</div>
      <div style="font-size:24px;font-weight:bold;color:${config.color};margin:8px 0;">${config.emoji} ${config.text}</div>
    </div>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn btn-outline">View Details</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • Automated Notification</p></div>
</div></div></body></html>`;
}

// ==================== SLA REMINDER ====================

export function slaReminderNotification(data: {
  ticketCode: string;
  subject: string;
  hoursOverdue: number;
  priority: string;
  departmentName: string;
  creatorName: string;
  lastResponseAt: string;
  ticketUrl: string;
  recipientName: string;
  escalationLevel: "warning" | "critical" | "severe";
}): string {
  const defaultLevel = { emoji: "⚠️", title: "SLA Warning", alertClass: "alert-warning", color: "#f59e0b" };
  const levelConfig: Record<string, { emoji: string; title: string; alertClass: string; color: string }> = {
    warning: defaultLevel,
    critical: { emoji: "🚨", title: "SLA Critical", alertClass: "alert-danger", color: "#ef4444" },
    severe: { emoji: "🔥", title: "SLA SEVERE - IMMEDIATE ACTION REQUIRED", alertClass: "alert-danger", color: "#991b1b" },
  };
  const config = levelConfig[data.escalationLevel] ?? defaultLevel;
  
  return `<!DOCTYPE html><html><head><style>${baseStyles}</style></head><body>
<div class="wrapper"><div class="container">
  <div class="header" style="background:linear-gradient(135deg, ${config.color} 0%, #0a1628 100%);">
    <h1>${config.emoji} ${config.title}</h1>
    <p>Ticket requires immediate attention</p>
  </div>
  <div class="content">
    <p>Hi <strong>${data.recipientName}</strong>,</p>
    
    <div class="alert ${config.alertClass}">
      <strong>${config.emoji} This ticket has been waiting for ${data.hoursOverdue} hours without response!</strong>
    </div>
    
    <div class="ticket-box">
      <div class="label">Ticket Number</div>
      <div class="ticket-code">${data.ticketCode}</div>
      <div class="divider"></div>
      <div class="grid">
        <div class="grid-col"><div class="label">Priority</div><div class="value">${getPriorityBadge(data.priority)}</div></div>
        <div class="grid-col"><div class="label">Department</div><div class="value">${data.departmentName}</div></div>
      </div>
      <div class="label">Subject</div>
      <div class="value">${data.subject}</div>
      <div class="label">Submitted By</div>
      <div class="value">${data.creatorName}</div>
      <div class="label">Last Activity</div>
      <div class="value">${data.lastResponseAt}</div>
    </div>
    
    <p class="text-muted">Please respond to this ticket as soon as possible to maintain our service quality standards.</p>
    
    <div class="text-center">
      <a href="${data.ticketUrl}" class="btn">Respond Now</a>
    </div>
  </div>
  <div class="footer"><p>UGC Ticketing System • SLA Monitoring</p></div>
</div></div></body></html>`;
}
