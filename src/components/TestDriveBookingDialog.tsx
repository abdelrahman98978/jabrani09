import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { format, addDays } from "date-fns";
import { ar } from "date-fns/locale";
import { CalendarIcon, Car, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestDriveBookingDialogProps {
  carId: string;
  carName: string;
  trigger?: React.ReactNode;
}

const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"
];

const TestDriveBookingDialog = ({ carId, carName, trigger }: TestDriveBookingDialogProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });

  const bookingMutation = useMutation({
    mutationFn: async () => {
      if (!date || !time) throw new Error("Please select date and time");
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data: booking, error } = await supabase.from("test_drive_bookings").insert({
        car_id: carId,
        user_id: session?.user?.id || null,
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_email: formData.email || null,
        booking_date: format(date, "yyyy-MM-dd"),
        booking_time: time,
        notes: formData.notes || null,
        status: "pending",
      }).select("id").single();
      
      if (error) throw error;

      // Send email notifications
      try {
        await supabase.functions.invoke("send-test-drive-notification", {
          body: {
            bookingId: booking.id,
            customerEmail: formData.email,
            customerName: formData.name,
            customerPhone: formData.phone,
            carName: carName,
            bookingDate: format(date, "yyyy-MM-dd"),
            bookingTime: time,
            language: language,
          },
        });
      } catch (emailError) {
        console.error("Failed to send notification email:", emailError);
        // Don't throw - booking was successful even if email fails
      }
    },
    onSuccess: () => {
      setSuccess(true);
      toast.success(isRTL ? "تم حجز تجربة القيادة بنجاح!" : "Test drive booked successfully!");
    },
    onError: (error) => {
      console.error(error);
      toast.error(isRTL ? "حدث خطأ أثناء الحجز" : "Error booking test drive");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !date || !time) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }
    bookingMutation.mutate();
  };

  const resetForm = () => {
    setFormData({ name: "", phone: "", email: "", notes: "" });
    setDate(undefined);
    setTime("");
    setSuccess(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(resetForm, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="gold" className="gap-2">
            <Car className="h-4 w-4" />
            {isRTL ? "حجز تجربة قيادة" : "Book Test Drive"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isRTL ? "تم الحجز بنجاح!" : "Booking Confirmed!"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {isRTL 
                ? "سنتواصل معك قريباً لتأكيد موعد تجربة القيادة"
                : "We'll contact you soon to confirm your test drive appointment"}
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm space-y-1">
              <p><strong>{isRTL ? "السيارة:" : "Car:"}</strong> {carName}</p>
              <p><strong>{isRTL ? "التاريخ:" : "Date:"}</strong> {date && format(date, "PPP", { locale: isRTL ? ar : undefined })}</p>
              <p><strong>{isRTL ? "الوقت:" : "Time:"}</strong> {time}</p>
            </div>
            <Button className="mt-6" onClick={() => handleOpenChange(false)}>
              {isRTL ? "إغلاق" : "Close"}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                {isRTL ? "حجز تجربة قيادة" : "Book Test Drive"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg text-sm">
                <strong>{isRTL ? "السيارة:" : "Car:"}</strong> {carName}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRTL ? "التاريخ *" : "Date *"}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-start font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="me-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: isRTL ? ar : undefined }) : (isRTL ? "اختر التاريخ" : "Pick a date")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>{isRTL ? "الوقت *" : "Time *"}</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? "اختر الوقت" : "Select time"} />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "الاسم الكامل *" : "Full Name *"}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={isRTL ? "أدخل اسمك" : "Enter your name"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "رقم الهاتف *" : "Phone Number *"}</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 5X XXX XXXX"
                  required
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "البريد الإلكتروني" : "Email"}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={isRTL ? "أي ملاحظات إضافية..." : "Any additional notes..."}
                  rows={2}
                />
              </div>

              <Button type="submit" className="w-full" disabled={bookingMutation.isPending}>
                {bookingMutation.isPending 
                  ? (isRTL ? "جاري الحجز..." : "Booking...") 
                  : (isRTL ? "تأكيد الحجز" : "Confirm Booking")}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TestDriveBookingDialog;
