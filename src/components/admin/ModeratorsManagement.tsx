import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Trash2, 
  Shield, 
  ShieldCheck, 
  User, 
  Search,
  Loader2,
  Crown,
  UserCog
} from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  profile?: {
    full_name: string | null;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  email?: string;
}

const ModeratorsManagement = () => {
  const { language } = useLanguage();
  const { tenant } = useTenant();
  const isRTL = language === "ar";
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AppRole>("moderator");

  // Fetch user roles with profiles
  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user-roles", tenant?.id],
    queryFn: async () => {
      if (!tenant) return [];

      const { data: roles, error } = await supabase
        .from("user_roles")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Fetch profiles for each user_id
      const rolesWithProfiles = await Promise.all(
        roles.map(async (role) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("full_name, phone, avatar_url, user_id")
            .eq("user_id", role.user_id)
            .maybeSingle();
          
          return {
            ...role,
            profile: profileData || null,
          };
        })
      );
      
      return rolesWithProfiles as UserRole[];
    },
  });

  // Add new role mutation
  const addRoleMutation = useMutation({
    mutationFn: async ({ email, role }: { email: string; role: AppRole }) => {
      // Find user by checking profiles first
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", email)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        throw new Error(
          isRTL
            ? "لم يتم العثور على مستخدم بهذا البريد. تأكد من تسجيل المستخدم أولاً."
            : "User not found with this email. Ensure the user is registered first."
        );
      }

      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: profile.user_id, role, tenant_id: tenant?.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      setIsDialogOpen(false);
      setNewUserEmail("");
      toast({
        title: isRTL ? "تم إضافة الصلاحية" : "Role Added",
        description: isRTL ? "تمت إضافة الصلاحية للمستخدم بنجاح" : "Role assigned successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  // Delete role mutation
  const deleteRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast({
        title: isRTL ? "تم حذف الصلاحية" : "Role Removed",
        description: isRTL ? "تم حذف صلاحية المستخدم" : "User role removed",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ roleId, newRole }: { roleId: string; newRole: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: newRole })
        .eq("id", roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-roles"] });
      toast({
        title: isRTL ? "تم تحديث الصلاحية" : "Role Updated",
        description: isRTL ? "تم تحديث صلاحية المستخدم" : "User role updated",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: isRTL ? "خطأ" : "Error",
        description: error.message,
      });
    },
  });

  const getRoleIcon = (role: AppRole) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4" />;
      case "moderator":
        return <ShieldCheck className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: AppRole) => {
    switch (role) {
      case "admin":
        return "default";
      case "moderator":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleLabel = (role: AppRole) => {
    const labels = {
      admin: isRTL ? "مدير" : "Admin",
      moderator: isRTL ? "مشرف" : "Moderator",
      user: isRTL ? "مستخدم" : "User",
    };
    return labels[role];
  };

  const filteredRoles = userRoles?.filter((ur) => {
    if (!searchQuery) return true;
    const name = ur.profile?.full_name || "";
    const phone = ur.profile?.phone || "";
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            {isRTL ? "إدارة المشرفين" : "Moderators Management"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRTL 
              ? "إدارة صلاحيات المستخدمين والمشرفين" 
              : "Manage user roles and permissions"}
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gold" className="gap-2">
              <Plus className="h-4 w-4" />
              {isRTL ? "إضافة مشرف" : "Add Moderator"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-primary" />
                {isRTL ? "إضافة مشرف جديد" : "Add New Moderator"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? "البريد الإلكتروني" : "Email Address"}
                </label>
                <Input
                  type="email"
                  placeholder={isRTL ? "أدخل البريد الإلكتروني" : "Enter email address"}
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isRTL ? "الصلاحية" : "Role"}
                </label>
                <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as AppRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        {isRTL ? "مدير" : "Admin"}
                      </div>
                    </SelectItem>
                    <SelectItem value="moderator">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        {isRTL ? "مشرف" : "Moderator"}
                      </div>
                    </SelectItem>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {isRTL ? "مستخدم" : "User"}
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={() => addRoleMutation.mutate({ email: newUserEmail, role: newUserRole })}
                disabled={!newUserEmail || addRoleMutation.isPending}
                className="w-full"
              >
                {addRoleMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  isRTL ? "إضافة" : "Add"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Crown className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "المديرين" : "Admins"}</p>
                <p className="text-2xl font-bold text-foreground">
                  {userRoles?.filter((r) => r.role === "admin").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "المشرفين" : "Moderators"}</p>
                <p className="text-2xl font-bold text-foreground">
                  {userRoles?.filter((r) => r.role === "moderator").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted-foreground/20 bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{isRTL ? "المستخدمين" : "Users"}</p>
                <p className="text-2xl font-bold text-foreground">
                  {userRoles?.filter((r) => r.role === "user").length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={isRTL ? "البحث بالاسم أو الهاتف..." : "Search by name or phone..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pe-10"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isRTL ? "قائمة الصلاحيات" : "Roles List"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles && filteredRoles.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? "المستخدم" : "User"}</TableHead>
                  <TableHead>{isRTL ? "الصلاحية" : "Role"}</TableHead>
                  <TableHead>{isRTL ? "التاريخ" : "Date"}</TableHead>
                  <TableHead>{isRTL ? "الإجراءات" : "Actions"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((userRole) => (
                  <TableRow key={userRole.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          {userRole.profile?.avatar_url ? (
                            <img 
                              src={userRole.profile.avatar_url} 
                              alt="" 
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {userRole.profile?.full_name || (isRTL ? "بدون اسم" : "No name")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {userRole.profile?.phone || "-"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(userRole.role)} className="gap-1">
                        {getRoleIcon(userRole.role)}
                        {getRoleLabel(userRole.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {new Date(userRole.created_at).toLocaleDateString(
                          language === "ar" ? "ar-SA" : "en-US"
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={userRole.role}
                          onValueChange={(newRole) =>
                            updateRoleMutation.mutate({
                              roleId: userRole.id,
                              newRole: newRole as AppRole,
                            })
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">{isRTL ? "مدير" : "Admin"}</SelectItem>
                            <SelectItem value="moderator">{isRTL ? "مشرف" : "Moderator"}</SelectItem>
                            <SelectItem value="user">{isRTL ? "مستخدم" : "User"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRoleMutation.mutate(userRole.id)}
                          disabled={deleteRoleMutation.isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                {isRTL ? "لا توجد صلاحيات مسجلة" : "No roles found"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeratorsManagement;
