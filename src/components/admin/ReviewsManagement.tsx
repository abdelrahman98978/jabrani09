import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { Check, X, Trash2, Search, Star, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

const ReviewsManagement = () => {
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", statusFilter, ratingFilter, tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      let query = supabase
        .from("car_reviews")
        .select(`
          *,
          cars:car_id (name_ar, name, main_image)
        `)
        .eq("tenant_id", tenant?.id)
        .order("created_at", { ascending: false });

      if (statusFilter === "pending") {
        query = query.eq("is_approved", false);
      } else if (statusFilter === "approved") {
        query = query.eq("is_approved", true);
      }

      if (ratingFilter !== "all") {
        query = query.eq("rating", parseInt(ratingFilter));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["review-stats", tenant?.id],
    enabled: !!tenant?.id,
    queryFn: async () => {
      const { data: all } = await supabase
        .from("car_reviews")
        .select("rating, is_approved")
        .eq("tenant_id", tenant?.id);
      const total = all?.length || 0;
      const pending = all?.filter(r => !r.is_approved).length || 0;
      const approved = all?.filter(r => r.is_approved).length || 0;
      const avgRating = all?.length 
        ? (all.reduce((sum, r) => sum + r.rating, 0) / all.length).toFixed(1) 
        : "0";
      return { total, pending, approved, avgRating };
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("car_reviews")
        .update({ is_approved: true })
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", tenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", tenant?.id] });
      toast.success(isRTL ? "تمت الموافقة على المراجعة" : "Review approved");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("car_reviews")
        .update({ is_approved: false })
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", tenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", tenant?.id] });
      toast.success(isRTL ? "تم رفض المراجعة" : "Review rejected");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase
        .from("car_reviews")
        .delete()
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews", tenant?.id] });
      queryClient.invalidateQueries({ queryKey: ["review-stats", tenant?.id] });
      toast.success(isRTL ? "تم حذف المراجعة" : "Review deleted");
    },
  });

  const filteredReviews = reviews?.filter(review => {
    if (!searchTerm) return true;
    const carName = review.cars?.name_ar || review.cars?.name || "";
    const content = review.content || "";
    return carName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           content.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "إجمالي المراجعات" : "Total Reviews"}
              </p>
              <p className="text-2xl font-bold">{stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-full">
              <Clock className="h-6 w-6 text-yellow-500" />
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
            <div className="p-3 bg-green-500/10 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "معتمدة" : "Approved"}
              </p>
              <p className="text-2xl font-bold">{stats?.approved || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Star className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {isRTL ? "متوسط التقييم" : "Avg Rating"}
              </p>
              <p className="text-2xl font-bold">{stats?.avgRating || "0"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{isRTL ? "إدارة المراجعات" : "Reviews Management"}</CardTitle>
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
                <SelectItem value="pending">{isRTL ? "قيد الانتظار" : "Pending"}</SelectItem>
                <SelectItem value="approved">{isRTL ? "معتمدة" : "Approved"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={isRTL ? "التقييم" : "Rating"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isRTL ? "الكل" : "All"}</SelectItem>
                {[5, 4, 3, 2, 1].map((r) => (
                  <SelectItem key={r} value={r.toString()}>
                    {r} {isRTL ? "نجوم" : "Stars"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reviews List */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? "جاري التحميل..." : "Loading..."}
            </div>
          ) : filteredReviews?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {isRTL ? "لا توجد مراجعات" : "No reviews found"}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews?.map((review) => (
                <Card key={review.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* Car Image */}
                      <div className="w-full md:w-24 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        <img
                          src={review.cars?.main_image || "/placeholder.svg"}
                          alt={review.cars?.name_ar || "Car"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Review Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">
                            {review.cars?.name_ar || review.cars?.name}
                          </span>
                          {renderStars(review.rating)}
                          <Badge variant={review.is_approved ? "default" : "secondary"}>
                            {review.is_approved 
                              ? (isRTL ? "معتمدة" : "Approved") 
                              : (isRTL ? "قيد الانتظار" : "Pending")}
                          </Badge>
                          {review.is_verified_purchase && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              {isRTL ? "مشتري موثق" : "Verified"}
                            </Badge>
                          )}
                        </div>

                        <div className="text-sm text-muted-foreground">
                          {format(new Date(review.created_at), "PPP", { locale: isRTL ? ar : undefined })}
                        </div>

                        {review.title && (
                          <p className="font-medium">{review.title}</p>
                        )}

                        {review.content && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {review.content}
                          </p>
                        )}

                        {(review.pros?.length > 0 || review.cons?.length > 0) && (
                          <div className="flex flex-wrap gap-4 text-sm">
                            {review.pros?.length > 0 && (
                              <div className="text-green-600">
                                <strong>{isRTL ? "مميزات:" : "Pros:"}</strong> {review.pros.join(", ")}
                              </div>
                            )}
                            {review.cons?.length > 0 && (
                              <div className="text-red-600">
                                <strong>{isRTL ? "عيوب:" : "Cons:"}</strong> {review.cons.join(", ")}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex md:flex-col gap-2 flex-shrink-0">
                        {!review.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => approveMutation.mutate(review.id)}
                            disabled={approveMutation.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        {review.is_approved && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-yellow-600 hover:text-yellow-700"
                            onClick={() => rejectMutation.mutate(review.id)}
                            disabled={rejectMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm(isRTL ? "هل أنت متأكد من حذف هذه المراجعة؟" : "Are you sure you want to delete this review?")) {
                              deleteMutation.mutate(review.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsManagement;
