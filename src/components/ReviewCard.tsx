import { ThumbsUp, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StarRating from "./StarRating";
import { useLanguage } from "@/contexts/LanguageContext";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface ReviewCardProps {
  review: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    pros: string[] | null;
    cons: string[] | null;
    is_verified_purchase: boolean;
    helpful_count: number;
    created_at: string;
    profiles?: {
      full_name: string | null;
    };
  };
  onHelpful?: (id: string) => void;
}

const ReviewCard = ({ review, onHelpful }: ReviewCardProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";

  const reviewDate = format(
    new Date(review.created_at),
    "d MMM yyyy",
    { locale: isRTL ? ar : enUS }
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium">
                {review.profiles?.full_name || (isRTL ? "مستخدم" : "User")}
              </span>
              {review.is_verified_purchase && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle className="h-3 w-3" />
                  {isRTL ? "مشتري موثق" : "Verified"}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} size="sm" />
              <span className="text-xs text-muted-foreground">{reviewDate}</span>
            </div>
          </div>
        </div>

        {/* Title */}
        {review.title && (
          <h4 className="font-bold mb-2">{review.title}</h4>
        )}

        {/* Content */}
        {review.content && (
          <p className="text-muted-foreground text-sm mb-4">{review.content}</p>
        )}

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {review.pros && review.pros.length > 0 && (
            <div>
              <p className="text-sm font-medium text-green-600 mb-1">
                {isRTL ? "المميزات" : "Pros"}
              </p>
              <ul className="space-y-1">
                {review.pros.map((pro, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-1">
                    <span className="text-green-600">+</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {review.cons && review.cons.length > 0 && (
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">
                {isRTL ? "العيوب" : "Cons"}
              </p>
              <ul className="space-y-1">
                {review.cons.map((con, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-1">
                    <span className="text-red-600">-</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Helpful */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isRTL ? "هل كانت هذه المراجعة مفيدة؟" : "Was this review helpful?"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onHelpful?.(review.id)}
            className="h-7 text-xs gap-1"
          >
            <ThumbsUp className="h-3 w-3" />
            {review.helpful_count > 0 && review.helpful_count}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
