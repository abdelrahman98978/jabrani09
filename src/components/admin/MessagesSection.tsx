import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { MessageSquare, Loader2, Phone, Mail, Eye, Archive, Trash2, CheckCircle, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const MessagesSection = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [linkingCustomer, setLinkingCustomer] = useState(false);

  const { data: messages, isLoading } = useQuery({
    queryKey: ["admin-messages", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("contact_messages")
        .select("*, cars(name_ar)")
        .order("created_at", { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data } = await query;
      return data || [];
    },
  });

  const updateMessage = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const updates: any = {};
      if (status) updates.status = status;
      if (admin_notes !== undefined) updates.admin_notes = admin_notes;
      
      const { error } = await supabase.from("contact_messages").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast({ title: isRTL ? "تم تحديث الرسالة" : "Message updated" });
    },
  });

  const linkToCustomer = useMutation({
    mutationFn: async (message: any) => {
      setLinkingCustomer(true);
      const { data: existing } = await supabase
        .from("customers")
        .select("*")
        .or(`phone.eq.${message.phone}${message.email ? `,email.eq.${message.email}` : ""}`)
        .maybeSingle();

      if (existing) {
        const { error: updateError } = await supabase
          .from("customers")
          .update({ last_interaction: new Date().toISOString() })
          .eq("id", existing.id);
        if (updateError) throw updateError;
        return existing;
      }

      const { data, error } = await supabase
        .from("customers")
        .insert({
          name: message.name,
          phone: message.phone,
          email: message.email || null,
          notes: message.message,
          customer_type: "potential",
          last_interaction: new Date().toISOString(),
        })
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: isRTL ? "تم ربط الرسالة بالعميل" : "Message linked to customer" });
    },
    onSettled: () => {
      setLinkingCustomer(false);
    },
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
      new: { label: isRTL ? "جديدة" : "New", class: "bg-blue-500/20 text-blue-400" },
      in_progress: { label: isRTL ? "قيد المتابعة" : "In progress", class: "bg-amber-500/20 text-amber-400" },
      closed: { label: isRTL ? "مغلقة" : "Closed", class: "bg-green-500/20 text-green-400" },
    };
    return statusMap[status] || { label: status, class: "bg-muted text-muted-foreground" };
  };

  const deleteMessage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contact_messages").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-messages"] });
      toast({ title: isRTL ? "تم حذف الرسالة" : "Message deleted" });
    },
  });

  const openMessage = (message: any) => {
    setSelectedMessage(message);
    setIsDialogOpen(true);
    if (message.status === "new") {
      updateMessage.mutate({ id: message.id, status: "in_progress" });
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {isRTL ? "الرسائل والاستفسارات" : "Messages & Inquiries"}
            {messages?.filter(m => m.status === "new").length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-500 text-white">
                {messages.filter(m => m.status === "new").length}
              </span>
            )}
          </CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
              <SelectItem value="new">{isRTL ? "جديدة" : "New"}</SelectItem>
              <SelectItem value="in_progress">{isRTL ? "قيد المتابعة" : "In progress"}</SelectItem>
              <SelectItem value="closed">{isRTL ? "مغلقة" : "Closed"}</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
            </div>
          ) : (
            <div className="space-y-3">
              {messages?.map(message => {
                const status = getStatusBadge(message.status);
                
                return (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      message.status === "new"
                        ? "bg-primary/5 border-primary/30"
                        : "bg-secondary/30 border-border/50 hover:border-primary/30"
                    }`}
                    onClick={() => openMessage(message)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{message.name}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{message.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {message.phone}
                          </span>
                          {message.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {message.email}
                            </span>
                          )}
                          {message.cars?.name_ar && (
                            <span className="text-primary">{message.cars.name_ar}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(message.created_at), "PPp", { locale: isRTL ? ar : undefined })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!messages || messages.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  {isRTL ? "لا توجد رسائل" : "No messages found"}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Message Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isRTL ? "تفاصيل الرسالة" : "Message Details"}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{selectedMessage.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedMessage.status).class}`}>
                    {getStatusBadge(selectedMessage.status).label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    <a href={`tel:${selectedMessage.phone}`} className="hover:text-primary">{selectedMessage.phone}</a>
                  </span>
                  {selectedMessage.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${selectedMessage.email}`} className="hover:text-primary">{selectedMessage.email}</a>
                    </span>
                  )}
                </div>
                {selectedMessage.subject && (
                  <p className="text-sm font-medium mb-2">{selectedMessage.subject}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{selectedMessage.message}</p>
                {selectedMessage.cars?.name_ar && (
                  <p className="text-sm text-primary mt-2">
                    {isRTL ? "السيارة:" : "Car:"} {selectedMessage.cars.name_ar}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-3">
                  {format(new Date(selectedMessage.created_at), "PPPp", { locale: isRTL ? ar : undefined })}
                </p>
              </div>

              <div>
                <Label>{isRTL ? "ملاحظات الإدارة" : "Admin Notes"}</Label>
                <Textarea
                  defaultValue={selectedMessage.admin_notes || ""}
                  placeholder={isRTL ? "أضف ملاحظات..." : "Add notes..."}
                  onBlur={(e) => {
                    if (e.target.value !== selectedMessage.admin_notes) {
                      updateMessage.mutate({ id: selectedMessage.id, admin_notes: e.target.value });
                    }
                  }}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateMessage.mutate({ id: selectedMessage.id, status: "in_progress" });
                    setSelectedMessage({ ...selectedMessage, status: "in_progress" });
                  }}
                >
                  <CheckCircle className="h-4 w-4 ml-1" />
                  {isRTL ? "قيد المتابعة" : "In progress"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    updateMessage.mutate({ id: selectedMessage.id, status: "closed" });
                    setSelectedMessage({ ...selectedMessage, status: "closed" });
                  }}
                >
                  <Archive className="h-4 w-4 ml-1" />
                  {isRTL ? "مغلقة" : "Closed"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedMessage && linkToCustomer.mutate(selectedMessage)}
                  disabled={linkingCustomer}
                >
                  {linkingCustomer ? (
                    <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 ml-1" />
                  )}
                  {isRTL ? "ربط كعميل" : "Link as customer"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    if (confirm(isRTL ? "هل أنت متأكد من حذف هذه الرسالة؟" : "Are you sure you want to delete this message?")) {
                      deleteMessage.mutate(selectedMessage.id);
                      setIsDialogOpen(false);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  {isRTL ? "حذف" : "Delete"}
                </Button>
                <Button
                  variant="gold"
                  size="sm"
                  className="mr-auto"
                  onClick={() => window.open(`https://wa.me/${selectedMessage.phone}`, "_blank")}
                >
                  {isRTL ? "تواصل عبر واتساب" : "Contact via WhatsApp"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessagesSection;
