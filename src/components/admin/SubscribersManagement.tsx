import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Users,
  Search,
  Plus,
  Trash2,
  Download,
  Upload,
  Mail,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  UserPlus,
  FileDown,
  FileUp,
} from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
}

const SubscribersManagement = () => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [importEmails, setImportEmails] = useState("");
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSubscribers(data || []);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addSubscriber = async () => {
    if (!newEmail.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال البريد الإلكتروني" : "Please enter an email",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "البريد الإلكتروني غير صالح" : "Invalid email format",
      });
      return;
    }

    setAdding(true);
    try {
      const { error } = await supabase.from("newsletter_subscribers").insert({
        email: newEmail.toLowerCase().trim(),
        is_active: true,
      });

      if (error) {
        if (error.code === "23505") {
          toast({
            variant: "destructive",
            title: isRTL ? "موجود مسبقاً" : "Already Exists",
            description: isRTL ? "هذا البريد مسجل مسبقاً" : "This email is already subscribed",
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: isRTL ? "تمت الإضافة" : "Added",
        description: isRTL ? "تم إضافة المشترك بنجاح" : "Subscriber added successfully",
      });
      setNewEmail("");
      setShowAddDialog(false);
      fetchSubscribers();
    } catch (error: any) {
      console.error("Error adding subscriber:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setAdding(false);
    }
  };

  const importSubscribers = async () => {
    if (!importEmails.trim()) {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "يرجى إدخال البريد الإلكتروني" : "Please enter emails",
      });
      return;
    }

    setImporting(true);
    try {
      const emails = importEmails
        .split(/[\n,;]/)
        .map((e) => e.trim().toLowerCase())
        .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

      if (emails.length === 0) {
        toast({
          variant: "destructive",
          title: isRTL ? "خطأ" : "Error",
          description: isRTL ? "لم يتم العثور على بريد إلكتروني صالح" : "No valid emails found",
        });
        return;
      }

      const subscribers = emails.map((email) => ({ email, is_active: true }));

      const { error } = await supabase
        .from("newsletter_subscribers")
        .upsert(subscribers, { onConflict: "email", ignoreDuplicates: true });

      if (error) throw error;

      toast({
        title: isRTL ? "تم الاستيراد" : "Imported",
        description: isRTL
          ? `تم استيراد ${emails.length} بريد إلكتروني`
          : `${emails.length} emails imported`,
      });
      setImportEmails("");
      setShowImportDialog(false);
      fetchSubscribers();
    } catch (error: any) {
      console.error("Error importing subscribers:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    } finally {
      setImporting(false);
    }
  };

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      setSubscribers((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_active: !currentStatus } : s))
      );

      toast({
        title: isRTL ? "تم التحديث" : "Updated",
        description: isRTL ? "تم تحديث حالة المشترك" : "Subscriber status updated",
      });
    } catch (error: any) {
      console.error("Error toggling status:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    }
  };

  const deleteSubscriber = async (id: string) => {
    try {
      const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id);

      if (error) throw error;

      setSubscribers((prev) => prev.filter((s) => s.id !== id));
      toast({
        title: isRTL ? "تم الحذف" : "Deleted",
        description: isRTL ? "تم حذف المشترك بنجاح" : "Subscriber deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting subscriber:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    }
  };

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter((s) => s.is_active);
    const csv = ["Email,Subscribed At", ...activeSubscribers.map((s) => `${s.email},${s.subscribed_at}`)].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: isRTL ? "تم التصدير" : "Exported",
      description: isRTL
        ? `تم تصدير ${activeSubscribers.length} مشترك`
        : `${activeSubscribers.length} subscribers exported`,
    });
  };

  const filteredSubscribers = subscribers.filter((s) => {
    const matchesSearch = s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "active" && s.is_active) ||
      (filter === "inactive" && !s.is_active);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.is_active).length,
    inactive: subscribers.filter((s) => !s.is_active).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {isRTL ? "إدارة المشتركين" : "Subscribers Management"}
          </h2>
          <p className="text-muted-foreground">
            {isRTL ? "إدارة قائمة المشتركين في النشرة البريدية" : "Manage your newsletter subscribers"}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={fetchSubscribers} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            {isRTL ? "تحديث" : "Refresh"}
          </Button>
          <Button variant="outline" onClick={exportSubscribers} className="gap-2">
            <FileDown className="w-4 h-4" />
            {isRTL ? "تصدير CSV" : "Export CSV"}
          </Button>
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <FileUp className="w-4 h-4" />
                {isRTL ? "استيراد" : "Import"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? "استيراد مشتركين" : "Import Subscribers"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{isRTL ? "قائمة البريد الإلكتروني" : "Email List"}</Label>
                  <textarea
                    className="w-full h-40 p-3 rounded-lg border bg-background text-sm"
                    placeholder={isRTL ? "أدخل البريد الإلكتروني (واحد لكل سطر أو مفصول بفاصلة)" : "Enter emails (one per line or comma-separated)"}
                    value={importEmails}
                    onChange={(e) => setImportEmails(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button onClick={importSubscribers} disabled={importing} className="gap-2">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isRTL ? "استيراد" : "Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="w-4 h-4" />
                {isRTL ? "إضافة مشترك" : "Add Subscriber"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{isRTL ? "إضافة مشترك جديد" : "Add New Subscriber"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>{isRTL ? "البريد الإلكتروني" : "Email Address"}</Label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  {isRTL ? "إلغاء" : "Cancel"}
                </Button>
                <Button onClick={addSubscriber} disabled={adding} className="gap-2">
                  {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isRTL ? "إضافة" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "إجمالي المشتركين" : "Total Subscribers"}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "المشتركين النشطين" : "Active Subscribers"}</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "الملغى اشتراكهم" : "Unsubscribed"}</p>
                <p className="text-2xl font-bold">{stats.inactive}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? "البحث بالبريد الإلكتروني..." : "Search by email..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("all")}
              >
                {isRTL ? "الكل" : "All"} ({stats.total})
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("active")}
              >
                {isRTL ? "النشطين" : "Active"} ({stats.active})
              </Button>
              <Button
                variant={filter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter("inactive")}
              >
                {isRTL ? "الملغيين" : "Inactive"} ({stats.inactive})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            {isRTL ? "قائمة المشتركين" : "Subscribers List"}
          </CardTitle>
          <CardDescription>
            {isRTL ? `عرض ${filteredSubscribers.length} من ${subscribers.length} مشترك` : `Showing ${filteredSubscribers.length} of ${subscribers.length} subscribers`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "البريد الإلكتروني" : "Email"}</TableHead>
                  <TableHead>{isRTL ? "الحالة" : "Status"}</TableHead>
                  <TableHead>{isRTL ? "تاريخ الاشتراك" : "Subscribed At"}</TableHead>
                  <TableHead className="text-right">{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscribers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {isRTL ? "لا يوجد مشتركين" : "No subscribers found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <TableRow key={subscriber.id}>
                      <TableCell className="font-medium">{subscriber.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subscriber.is_active}
                            onCheckedChange={() =>
                              toggleSubscriberStatus(subscriber.id, subscriber.is_active)
                            }
                          />
                          {subscriber.is_active ? (
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              {isRTL ? "نشط" : "Active"}
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {isRTL ? "ملغى" : "Inactive"}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(subscriber.subscribed_at).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                {isRTL ? "تأكيد الحذف" : "Confirm Deletion"}
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                {isRTL
                                  ? `هل أنت متأكد من حذف ${subscriber.email}؟ لا يمكن التراجع عن هذا الإجراء.`
                                  : `Are you sure you want to delete ${subscriber.email}? This action cannot be undone.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{isRTL ? "إلغاء" : "Cancel"}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteSubscriber(subscriber.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {isRTL ? "حذف" : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscribersManagement;
