import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StarRating from "./StarRating";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";

interface ReviewFormProps {
  carId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({ carId, userId, onSuccess, onCancel }: ReviewFormProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();

  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState("");
  const [newCon, setNewCon] = useState("");

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("car_reviews").insert({
        car_id: carId,
        user_id: userId,
        rating,
        title: title || null,
        content: content || null,
        pros: pros.length > 0 ? pros : null,
        cons: cons.length > 0 ? cons : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(isRTL ? "تم إرسال المراجعة للمراجعة" : "Review submitted for approval");
      queryClient.invalidateQueries({ queryKey: ["car-reviews", carId] });
      onSuccess?.();
    },
    onError: () => {
      toast.error(isRTL ? "حدث خطأ" : "An error occurred");
    },
  });

  const handleAddPro = () => {
    if (newPro.trim()) {
      setPros([...pros, newPro.trim()]);
      setNewPro("");
    }
  };

  const handleAddCon = () => {
    if (newCon.trim()) {
      setCons([...cons, newCon.trim()]);
      setNewCon("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error(isRTL ? "يرجى تحديد التقييم" : "Please select a rating");
      return;
    }
    submitReview.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isRTL ? "اكتب مراجعة" : "Write a Review"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <Label>{isRTL ? "التقييم" : "Rating"} *</Label>
            <div className="mt-2">
              <StarRating rating={rating} size="lg" interactive onChange={setRating} />
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">{isRTL ? "العنوان" : "Title"}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRTL ? "عنوان مختصر للمراجعة" : "Brief title for your review"}
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">{isRTL ? "المراجعة" : "Review"}</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={isRTL ? "شاركنا تجربتك مع هذه السيارة..." : "Share your experience with this car..."}
              rows={4}
            />
          </div>

          {/* Pros */}
          <div>
            <Label>{isRTL ? "المميزات" : "Pros"}</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder={isRTL ? "أضف ميزة" : "Add a pro"}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddPro())}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddPro}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {pros.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {pros.map((pro, index) => (
                  <span key={index} className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {pro}
                    <button type="button" onClick={() => setPros(pros.filter((_, i) => i !== index))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cons */}
          <div>
            <Label>{isRTL ? "العيوب" : "Cons"}</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder={isRTL ? "أضف عيب" : "Add a con"}
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCon())}
              />
              <Button type="button" variant="outline" size="icon" onClick={handleAddCon}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {cons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {cons.map((con, index) => (
                  <span key={index} className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-sm flex items-center gap-1">
                    {con}
                    <button type="button" onClick={() => setCons(cons.filter((_, i) => i !== index))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" variant="gold" disabled={submitReview.isPending}>
              {submitReview.isPending ? (isRTL ? "جاري الإرسال..." : "Submitting...") : (isRTL ? "إرسال المراجعة" : "Submit Review")}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {isRTL ? "إلغاء" : "Cancel"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
