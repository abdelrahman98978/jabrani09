import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { FileDown, Loader2 } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

interface InvoicePDFProps {
  order: any;
}

const InvoicePDF = ({ order }: InvoicePDFProps) => {
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const [generating, setGenerating] = useState(false);
  const { data: settings, isLoading: settingsLoading } = useSettings();

  // Fallback values for missing settings
  const showroomName = isRTL
    ? (settings?.showroom_name || "معرض السيارات")
    : (settings?.showroom_name_en || "Car Showroom");
  const showroomPhone = settings?.phone || "";

  const generatePDF = async () => {
    setGenerating(true);
    try {
      const jsPDF = (await import("jspdf")).default;

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set up fonts
      doc.setFont("helvetica", "bold");

      // Header
      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175);
      doc.text(showroomName, 105, 25, { align: "center" });

      // Invoice title
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(isRTL ? "فاتورة" : "INVOICE", 105, 40, { align: "center" });

      // Order number & date
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`${isRTL ? "رقم الطلب" : "Order #"}: ${order.order_number}`, 20, 55);
      doc.text(`${isRTL ? "التاريخ" : "Date"}: ${new Date(order.created_at).toLocaleDateString(isRTL ? "ar-SA" : "en-US")}`, 20, 62);

      // Customer info
      doc.setFont("helvetica", "bold");
      doc.text(isRTL ? "معلومات العميل" : "Customer Information", 20, 80);
      doc.setFont("helvetica", "normal");
      doc.text(`${isRTL ? "الاسم" : "Name"}: ${order.customers?.name || "-"}`, 20, 88);
      doc.text(`${isRTL ? "الهاتف" : "Phone"}: ${order.customers?.phone || "-"}`, 20, 95);
      if (order.customers?.email) {
        doc.text(`${isRTL ? "البريد" : "Email"}: ${order.customers.email}`, 20, 102);
      }

      // Car details
      doc.setFont("helvetica", "bold");
      doc.text(isRTL ? "تفاصيل السيارة" : "Car Details", 20, 120);
      doc.setFont("helvetica", "normal");

      if (order.cars) {
        doc.text(`${isRTL ? "السيارة" : "Car"}: ${order.cars.name_ar || order.cars.name || "-"}`, 20, 128);
        doc.text(`${isRTL ? "الموديل" : "Model"}: ${order.cars.model || "-"}`, 20, 135);
        doc.text(`${isRTL ? "السنة" : "Year"}: ${order.cars.year || "-"}`, 20, 142);
      }

      // Table header
      doc.setFillColor(240, 240, 240);
      doc.rect(20, 160, 170, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.text(isRTL ? "الوصف" : "Description", 25, 167);
      doc.text(isRTL ? "المبلغ" : "Amount", 165, 167, { align: "right" });

      // Table content
      doc.setFont("helvetica", "normal");
      const carName = order.cars?.name_ar || order.cars?.name || (isRTL ? "سيارة" : "Car");
      doc.text(carName, 25, 180);
      doc.text(`${Number(order.total_amount).toLocaleString()} ${settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}`, 165, 180, { align: "right" });

      // Total
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 195, 190, 195);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(isRTL ? "الإجمالي" : "Total", 25, 205);
      doc.setTextColor(30, 64, 175);
      doc.text(`${Number(order.total_amount).toLocaleString()} ${settings?.currency_symbol || (isRTL ? "ج.س" : "SDG")}`, 165, 205, { align: "right" });

      // Payment info
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(isRTL ? "معلومات الدفع" : "Payment Information", 20, 220);
      doc.setFont("helvetica", "normal");

      const paymentMethod = order.payment_method === "bank_transfer"
        ? (isRTL ? "تحويل بنكي" : "Bank Transfer")
        : (isRTL ? "نقدًا عند الاستلام" : "Cash on Delivery");
      doc.text(`${isRTL ? "طريقة الدفع" : "Method"}: ${paymentMethod}`, 20, 228);

      const paymentStatus = order.payment_status === "paid"
        ? (isRTL ? "مدفوع" : "Paid")
        : order.payment_status === "partial"
          ? (isRTL ? "جزئي" : "Partial")
          : (isRTL ? "معلق" : "Pending");
      doc.text(`${isRTL ? "حالة الدفع" : "Status"}: ${paymentStatus}`, 20, 235);

      // Bank details if bank transfer
      let yPosition = 245;
      if (order.payment_method === "bank_transfer" && (settings?.bank_name || settings?.bank_iban)) {
        doc.setFont("helvetica", "bold");
        doc.text(isRTL ? "بيانات التحويل البنكي" : "Bank Transfer Details", 20, yPosition);
        doc.setFont("helvetica", "normal");
        yPosition += 8;
        if (settings?.bank_name) {
          doc.text(`${isRTL ? "البنك" : "Bank"}: ${isRTL ? settings.bank_name : (settings.bank_name_en || settings.bank_name)}`, 20, yPosition);
          yPosition += 7;
        }
        if (settings?.bank_account_name) {
          doc.text(`${isRTL ? "صاحب الحساب" : "Account Holder"}: ${settings.bank_account_name}`, 20, yPosition);
          yPosition += 7;
        }
        if (settings?.bank_account_number) {
          doc.text(`${isRTL ? "رقم الحساب" : "Account #"}: ${settings.bank_account_number}`, 20, yPosition);
          yPosition += 7;
        }
        if (settings?.bank_iban) {
          doc.text(`IBAN: ${settings.bank_iban}`, 20, yPosition);
          yPosition += 10;
        }
      }

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(showroomName, 105, 285, { align: "center" });
      if (showroomPhone) {
        doc.text(`${isRTL ? "هاتف" : "Phone"}: ${showroomPhone}`, 105, 290, { align: "center" });
      }

      // Save
      doc.save(`invoice-${order.order_number}.pdf`);

      toast({
        title: isRTL ? "تم التحميل" : "Downloaded",
        description: isRTL ? "تم تحميل الفاتورة بنجاح" : "Invoice downloaded successfully",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: isRTL ? "فشل إنشاء الفاتورة" : "Failed to generate invoice",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDF}
      disabled={generating}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4" />
      )}
      {isRTL ? "تحميل الفاتورة" : "Download Invoice"}
    </Button>
  );
};

export default InvoicePDF;
