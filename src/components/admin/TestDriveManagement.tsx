import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { 
  Search, Car, Calendar, Clock, Phone, Mail, User, 
  CheckCircle, XCircle, Clock3, MessageSquare 
} from "lucide-react";

const statusConfig: Record<string, { label: { ar: string; en: string }; color: string }> = {
  pending: { label: { ar: "قيد الانتظار", en: "Pending" }, color: "bg-yellow-500" },
  confirmed: { label: { ar: "مؤكد", en: "Confirmed" }, color: "bg-blue-500" },
  completed: { label: { ar: "مكتمل", en: "Completed" }, color: "bg-green-500" },
  cancelled: { label: { ar: "ملغى", en: "Cancelled" }, color: "bg-red-500" },
};

const TestDriveManagement = () => {
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["test-drive-bookings", statusFilter, tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];
      let query = supabase
        .from("test_drive_bookings")
        .select(`
          *,
          cars:car_id (name_ar, name, main_image)
        `)
        .eq("tenant_id", tenant.id)
        .order("booking_date", { ascending: true })
        .order("booking_time", { ascending: true });

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["test-drive-stats", tenant?.id],
    queryFn: async () => {
      if (!tenant) return { total: 0, pending: 0, confirmed: 0, completed: 0 };
      const { data } = await supabase
        .from("test_drive_bookings")
        .select("status")
        .eq("tenant_id", tenant.id);
      const total = data?.length || 0;
      const pending = data?.filter(b => b.status === "pending").length || 0;
      const confirmed = data?.filter(b => b.status === "confirmed").length || 0;
      const completed = data?.filter(b => b.status === "completed").length || 0;
      return { total, pending, confirmed, completed };
    },
    enabled: !!tenant,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }: { id: string; status: string; notes?: string }) => {
      const updateData: any = { status };
      if (notes !== undefined) {
        updateData.admin_notes = notes;
      }
      const { error } = await supabase
        .from("test_drive_bookings")
        .update(updateData)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-drive-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["test-drive-stats"] });
      toast.success(isRTL ? "تم تحديث الحجز" : "Booking updated");
      setSelectedBooking(null);
    },
  });

  const filteredBookings = bookings?.filter(booking => {
    if (!searchTerm) return true;
    return booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           booking.customer_phone.includes(searchTerm) ||
           booking.cars?.name_ar?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleStatusUpdate = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status, notes: adminNotes });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "إجمالي الحجوزات" : "Total Bookings"}
              </p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Clock3 className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "قيد الانتظار" : "Pending"}
              </p>
              <p className="text-2xl font-bold">{stats?.pending || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "مؤكدة" : "Confirmed"}
              </p>
              <p className="text-2xl font-bold">{stats?.confirmed || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "مكتملة" : "Completed"}
              </p>
              <p className="text-2xl font-bold">{stats?.completed || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "حجوزات تجربة القيادة" : "Test Drive Bookings"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isRTL ? "بحث..." : "Search..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="ps-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isRTL ? "الحالة" : "Status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                {Object.entries(statusConfig).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.label[isRTL ? "ar" : "en"]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bookings List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : filteredBookings?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? "لا توجد حجوزات" : "No bookings found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings?.map((booking) => (
                <Card key={booking.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Car Image */}
                      <div className="w-full md:w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={booking.cars?.main_image || "/placeholder.svg"}
                          alt={booking.cars?.name_ar || "Car"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Booking Info */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">
                            {booking.cars?.name_ar || booking.cars?.name || (isRTL ? "سيارة محذوفة" : "Deleted car")}
                          </span>
                          <Badge className={statusConfig[booking.status]?.color}>
                            {statusConfig[booking.status]?.label[isRTL ? "ar" : "en"]}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-4 w-4" />
                            {booking.customer_name}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span dir="ltr">{booking.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(booking.booking_date), "PPP", { locale: isRTL ? ar : undefined })}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {booking.booking_time}
                          </div>
                        </div>

                        {booking.customer_email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            {booking.customer_email}
                          </div>
                        )}

                        {booking.notes && (
                          <div className="flex items-start gap-1 text-sm text-muted-foreground">
                            <MessageSquare className="h-4 w-4 mt-0.5" />
                            <span>{booking.notes}</span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 flex-shrink-0">
                        {booking.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setAdminNotes(booking.admin_notes || "");
                              }}
                            >
                              <CheckCircle className="h-4 w-4 me-1" />
                              {isRTL ? "تأكيد" : "Confirm"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleStatusUpdate(booking.id, "cancelled")}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {booking.status === "confirmed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => handleStatusUpdate(booking.id, "completed")}
                          >
                            <CheckCircle className="h-4 w-4 me-1" />
                            {isRTL ? "مكتمل" : "Complete"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm Dialog */}
      <Dialog open={!!selectedBooking} onOpenChange={(open) => !open && setSelectedBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isRTL ? "تأكيد الحجز" : "Confirm Booking"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm space-y-1">
              <p><strong>{isRTL ? "العميل:" : "Customer:"}</strong> {selectedBooking?.customer_name}</p>
              <p><strong>{isRTL ? "الهاتف:" : "Phone:"}</strong> {selectedBooking?.customer_phone}</p>
              <p><strong>{isRTL ? "التاريخ:" : "Date:"}</strong> {selectedBooking?.booking_date}</p>
              <p><strong>{isRTL ? "الوقت:" : "Time:"}</strong> {selectedBooking?.booking_time}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {isRTL ? "ملاحظات الأدمن" : "Admin Notes"}
              </label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={isRTL ? "أضف ملاحظات..." : "Add notes..."}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleStatusUpdate(selectedBooking.id, "confirmed")}
                disabled={updateStatusMutation.isPending}
              >
                {isRTL ? "تأكيد الحجز" : "Confirm Booking"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedBooking(null)}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TestDriveManagement;
