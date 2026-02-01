import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import StarRating from "./StarRating";
import { MessageSquare, Plus } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface ReviewsListProps {
  carId: string;
}

const ReviewsList = ({ carId }: ReviewsListProps) => {
  const { language } = useLanguage();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const [sortBy, setSortBy] = useState("newest");
  const [showForm, setShowForm] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
  }, []);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["car-reviews", carId, sortBy],
    queryFn: async () => {
      let query = supabase
        .from("car_reviews")
        .select("*")
        .eq("car_id", carId)
        .eq("is_approved", true);

      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "highest") {
        query = query.order("rating", { ascending: false });
      } else if (sortBy === "helpful") {
        query = query.order("helpful_count", { ascending: false });
      }

      const { data } = await query;
      return data || [];
    },
  });

  const markHelpful = useMutation({
    mutationFn: async (reviewId: string) => {
      const currentReview = reviews?.find(r => r.id === reviewId);
      const currentCount = currentReview?.helpful_count ?? 0;
      await supabase
        .from("car_reviews")
        .update({ helpful_count: currentCount + 1 })
        .eq("id", reviewId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["car-reviews", carId] });
    },
  });

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = reviews?.reduce((acc, r) => {
    acc[r.rating] = (acc[r.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            {isRTL ? "التقييمات والمراجعات" : "Ratings & Reviews"}
          </h3>
          {reviews && reviews.length > 0 && (
            <div className="flex items-center gap-3 mt-2">
              <StarRating rating={averageRating} showValue />
              <span className="text-sm text-muted-foreground">
                ({reviews.length} {isRTL ? "مراجعة" : "reviews"})
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {reviews && reviews.length > 0 && (
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{isRTL ? "الأحدث" : "Newest"}</SelectItem>
                <SelectItem value="highest">{isRTL ? "الأعلى تقييماً" : "Highest Rated"}</SelectItem>
                <SelectItem value="helpful">{isRTL ? "الأكثر إفادة" : "Most Helpful"}</SelectItem>
              </SelectContent>
            </Select>
          )}
          {user && !showForm && (
            <Button variant="gold" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 me-2" />
              {isRTL ? "اكتب مراجعة" : "Write Review"}
            </Button>
          )}
        </div>
      </div>

      {/* Rating Breakdown */}
      {reviews && reviews.length > 0 && (
        <div className="bg-secondary/30 rounded-lg p-4">
          <div className="grid grid-cols-5 gap-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-sm w-4">{star}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-full transition-all"
                    style={{
                      width: `${reviews.length > 0 ? ((ratingCounts[star] || 0) / reviews.length) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-6">
                  {ratingCounts[star] || 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Review Form */}
      {showForm && user && (
        <ReviewForm
          carId={carId}
          userId={user.id}
          onSuccess={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={{
                ...review,
                profiles: undefined
              }}
              onHelpful={(id) => markHelpful.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-secondary/30 rounded-lg">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">
            {isRTL ? "لا توجد مراجعات بعد. كن أول من يكتب مراجعة!" : "No reviews yet. Be the first to write one!"}
          </p>
          {user && !showForm && (
            <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
              {isRTL ? "اكتب مراجعة" : "Write Review"}
            </Button>
          )}
          {!user && (
            <p className="text-sm text-muted-foreground mt-2">
              {isRTL ? "سجل الدخول لكتابة مراجعة" : "Sign in to write a review"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewsList;
