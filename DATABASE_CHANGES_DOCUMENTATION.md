# 📊 توثيق التغييرات في قاعدة البيانات
# Database Changes Documentation

## 🎯 نظرة عامة / Overview

تم إضافة جداول جديدة لتتبع التغييرات في معلومات المعرض وإدارة طلبات السيارات من العملاء.

New tables have been added to track showroom information changes and manage customer car requests.

---

## 📋 الجداول الجديدة / New Tables

### 1. 🏢 `showroom_changes` - تتبع تغييرات المعرض

جدول لتتبع جميع التغييرات في معلومات المعرض (الاسم، الرقم، الموقع، الصور، الوضع).

**الحقول / Fields:**

| Field | Type | Description (AR) | Description (EN) |
|-------|------|------------------|------------------|
| `id` | UUID | المعرف الفريد | Unique identifier |
| `showroom_name` | TEXT | اسم المعرض بالإنجليزية | Showroom name in English |
| `showroom_name_ar` | TEXT | اسم المعرض بالعربية | Showroom name in Arabic |
| `phone` | TEXT | رقم الهاتف | Phone number |
| `whatsapp` | TEXT | رقم الواتساب | WhatsApp number |
| `location` | TEXT | الموقع بالإنجليزية | Location in English |
| `location_ar` | TEXT | الموقع بالعربية | Location in Arabic |
| `city` | TEXT | المدينة بالإنجليزية | City in English |
| `city_ar` | TEXT | المدينة بالعربية | City in Arabic |
| `country` | TEXT | الدولة بالإنجليزية | Country in English |
| `country_ar` | TEXT | الدولة بالعربية | Country in Arabic |
| `latitude` | DECIMAL(10,8) | خط العرض | Latitude coordinate |
| `longitude` | DECIMAL(11,8) | خط الطول | Longitude coordinate |
| `logo_url` | TEXT | رابط الشعار | Logo URL |
| `cover_image_url` | TEXT | رابط صورة الغلاف | Cover image URL |
| `gallery_images` | TEXT[] | مجموعة صور المعرض | Gallery images array |
| `default_theme` | TEXT | الوضع الافتراضي (light/dark/auto) | Default theme mode |
| `changed_by` | UUID | المستخدم الذي أجرى التغيير | User who made the change |
| `change_reason` | TEXT | سبب التغيير بالإنجليزية | Change reason in English |
| `change_reason_ar` | TEXT | سبب التغيير بالعربية | Change reason in Arabic |
| `is_active` | BOOLEAN | هل التغيير نشط؟ | Is this change active? |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء | Creation timestamp |
| `applied_at` | TIMESTAMPTZ | تاريخ التطبيق | Application timestamp |

**مثال على الاستخدام / Usage Example:**

```typescript
// إضافة تغيير جديد / Add new change
const { data, error } = await supabase
  .from('showroom_changes')
  .insert({
    showroom_name: 'Al-Fakhim Car Showroom',
    showroom_name_ar: 'معرض الفخيم للسيارات',
    phone: '+249123044745',
    whatsapp: '249123044745',
    city: 'Port Sudan',
    city_ar: 'بورتسودان',
    country: 'Sudan',
    country_ar: 'السودان',
    default_theme: 'dark',
    is_active: true,
    change_reason: 'Updated contact information',
    change_reason_ar: 'تحديث معلومات الاتصال'
  });

// الحصول على التغيير النشط / Get active change
const { data: activeChange } = await supabase
  .from('showroom_changes')
  .select('*')
  .eq('is_active', true)
  .single();
```

---

### 2. 🚗 `requested_cars` - السيارات المطلوبة

جدول لإدارة طلبات العملاء للسيارات التي يبحثون عنها.

**الحقول / Fields:**

| Field | Type | Description (AR) | Description (EN) |
|-------|------|------------------|------------------|
| `id` | UUID | المعرف الفريد | Unique identifier |
| `brand_name` | TEXT | اسم العلامة التجارية | Brand name |
| `brand_name_ar` | TEXT | اسم العلامة التجارية بالعربية | Brand name in Arabic |
| `model` | TEXT | الموديل | Model |
| `model_ar` | TEXT | الموديل بالعربية | Model in Arabic |
| `year` | INTEGER | سنة الصنع | Manufacturing year |
| `customer_name` | TEXT | اسم العميل | Customer name |
| `customer_phone` | TEXT | رقم هاتف العميل | Customer phone |
| `customer_email` | TEXT | بريد العميل الإلكتروني | Customer email |
| `customer_whatsapp` | TEXT | واتساب العميل | Customer WhatsApp |
| `preferred_color` | TEXT | اللون المفضل | Preferred color |
| `preferred_color_ar` | TEXT | اللون المفضل بالعربية | Preferred color in Arabic |
| `max_budget` | DECIMAL(12,2) | الميزانية القصوى | Maximum budget |
| `transmission_preference` | TEXT | تفضيل ناقل الحركة | Transmission preference |
| `fuel_type_preference` | TEXT | تفضيل نوع الوقود | Fuel type preference |
| `notes` | TEXT | ملاحظات بالإنجليزية | Notes in English |
| `notes_ar` | TEXT | ملاحظات بالعربية | Notes in Arabic |
| `status` | TEXT | حالة الطلب | Request status |
| `priority` | TEXT | الأولوية | Priority level |
| `assigned_to` | UUID | مسؤول المتابعة | Assigned staff member |
| `last_contact_date` | TIMESTAMPTZ | تاريخ آخر اتصال | Last contact date |
| `next_follow_up_date` | TIMESTAMPTZ | تاريخ المتابعة القادمة | Next follow-up date |
| `created_at` | TIMESTAMPTZ | تاريخ الإنشاء | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | تاريخ التحديث | Update timestamp |
| `completed_at` | TIMESTAMPTZ | تاريخ الإكمال | Completion timestamp |

**القيم المسموحة / Allowed Values:**

- **status**: `pending`, `processing`, `found`, `notified`, `completed`, `cancelled`
- **priority**: `low`, `normal`, `high`, `urgent`
- **transmission_preference**: `automatic`, `manual`, `any`
- **fuel_type_preference**: `petrol`, `diesel`, `hybrid`, `electric`, `any`

**مثال على الاستخدام / Usage Example:**

```typescript
// إضافة طلب سيارة جديد / Add new car request
const { data, error } = await supabase
  .from('requested_cars')
  .insert({
    brand_name: 'Toyota',
    brand_name_ar: 'تويوتا',
    model: 'Land Cruiser',
    model_ar: 'لاند كروزر',
    year: 2024,
    customer_name: 'أحمد محمد',
    customer_phone: '+249123456789',
    customer_email: 'ahmed@example.com',
    preferred_color: 'White',
    preferred_color_ar: 'أبيض',
    max_budget: 450000,
    transmission_preference: 'automatic',
    fuel_type_preference: 'diesel',
    notes: 'Looking for a well-maintained vehicle',
    notes_ar: 'أبحث عن سيارة بحالة جيدة',
    status: 'pending',
    priority: 'normal'
  });

// الحصول على جميع الطلبات المعلقة / Get all pending requests
const { data: pendingRequests } = await supabase
  .from('requested_cars')
  .select('*')
  .eq('status', 'pending')
  .order('created_at', { ascending: false });

// تحديث حالة الطلب / Update request status
const { data: updated } = await supabase
  .from('requested_cars')
  .update({ 
    status: 'found',
    completed_at: new Date().toISOString()
  })
  .eq('id', requestId);
```

---

### 3. 📜 `settings_history` - تاريخ تغييرات الإعدادات

جدول لتتبع جميع التغييرات التي تحدث في جدول الإعدادات.

**الحقول / Fields:**

| Field | Type | Description (AR) | Description (EN) |
|-------|------|------------------|------------------|
| `id` | UUID | المعرف الفريد | Unique identifier |
| `setting_id` | UUID | معرف الإعداد | Settings record ID |
| `field_name` | TEXT | اسم الحقل المتغير | Changed field name |
| `old_value` | TEXT | القيمة القديمة | Old value |
| `new_value` | TEXT | القيمة الجديدة | New value |
| `changed_by` | UUID | المستخدم الذي أجرى التغيير | User who made the change |
| `changed_at` | TIMESTAMPTZ | تاريخ التغيير | Change timestamp |

**مثال على الاستخدام / Usage Example:**

```typescript
// الحصول على تاريخ التغييرات / Get change history
const { data: history } = await supabase
  .from('settings_history')
  .select('*')
  .order('changed_at', { ascending: false })
  .limit(50);

// الحصول على تغييرات حقل معين / Get changes for specific field
const { data: phoneChanges } = await supabase
  .from('settings_history')
  .select('*')
  .eq('field_name', 'phone')
  .order('changed_at', { ascending: false });
```

---

## 🔐 سياسات الأمان / Security Policies

### `showroom_changes`
- ✅ **القراءة العامة**: يمكن للجميع رؤية التغييرات النشطة فقط
- ❌ **الكتابة**: محظورة للمستخدمين العاديين (Admin فقط)

### `requested_cars`
- ✅ **الإضافة العامة**: يمكن لأي شخص إضافة طلب سيارة
- ✅ **القراءة المحدودة**: المستخدمون يمكنهم رؤية طلباتهم فقط
- ❌ **التعديل**: محظور للمستخدمين العاديين (Admin فقط)

### `settings_history`
- ✅ **القراءة للمصادقين**: المستخدمون المسجلون فقط
- ❌ **الكتابة**: تلقائية عبر Triggers فقط

---

## 🔄 Triggers التلقائية / Automatic Triggers

### 1. تحديث `updated_at` تلقائياً
```sql
-- يتم تحديث حقل updated_at تلقائياً عند أي تعديل
CREATE TRIGGER update_requested_cars_updated_at 
  BEFORE UPDATE ON public.requested_cars 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. تسجيل التغييرات في الإعدادات
```sql
-- يتم تسجيل أي تغيير في جدول settings تلقائياً
CREATE TRIGGER log_settings_changes_trigger
  AFTER UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION log_settings_changes();
```

---

## 📊 الفهارس / Indexes

تم إضافة فهارس لتحسين الأداء:

```sql
-- Showroom Changes
CREATE INDEX idx_showroom_changes_active ON showroom_changes(is_active);

-- Requested Cars
CREATE INDEX idx_requested_cars_status ON requested_cars(status);
CREATE INDEX idx_requested_cars_customer_phone ON requested_cars(customer_phone);
CREATE INDEX idx_requested_cars_created_at ON requested_cars(created_at DESC);

-- Settings History
CREATE INDEX idx_settings_history_setting_id ON settings_history(setting_id);
CREATE INDEX idx_settings_history_changed_at ON settings_history(changed_at DESC);
```

---

## 🎨 حالات الاستخدام / Use Cases

### 1. تتبع تغييرات معلومات المعرض
```typescript
// عند تغيير رقم الهاتف أو الموقع
async function updateShowroomInfo(newInfo: Partial<ShowroomChanges>) {
  // إلغاء تفعيل التغيير الحالي
  await supabase
    .from('showroom_changes')
    .update({ is_active: false })
    .eq('is_active', true);
  
  // إضافة التغيير الجديد
  const { data } = await supabase
    .from('showroom_changes')
    .insert({
      ...newInfo,
      is_active: true,
      changed_by: currentUser.id
    });
  
  return data;
}
```

### 2. إدارة طلبات السيارات
```typescript
// نموذج طلب سيارة من العميل
async function submitCarRequest(request: CarRequest) {
  const { data, error } = await supabase
    .from('requested_cars')
    .insert({
      brand_name: request.brand,
      model: request.model,
      customer_name: request.name,
      customer_phone: request.phone,
      customer_email: request.email,
      max_budget: request.budget,
      notes: request.notes,
      status: 'pending',
      priority: 'normal'
    });
  
  if (!error) {
    // إرسال إشعار للإدارة
    await notifyAdminNewRequest(data);
  }
  
  return { data, error };
}
```

### 3. تتبع التغييرات التاريخية
```typescript
// عرض تاريخ التغييرات
async function getSettingsHistory(fieldName?: string) {
  let query = supabase
    .from('settings_history')
    .select('*')
    .order('changed_at', { ascending: false });
  
  if (fieldName) {
    query = query.eq('field_name', fieldName);
  }
  
  const { data } = await query.limit(100);
  return data;
}
```

---

## 🔧 الصيانة / Maintenance

### تنظيف البيانات القديمة
```sql
-- حذف سجلات التاريخ الأقدم من سنة
DELETE FROM settings_history 
WHERE changed_at < NOW() - INTERVAL '1 year';

-- أرشفة الطلبات المكتملة القديمة
UPDATE requested_cars 
SET status = 'archived' 
WHERE status = 'completed' 
  AND completed_at < NOW() - INTERVAL '6 months';
```

---

## 📝 ملاحظات مهمة / Important Notes

1. **الوضع الافتراضي (Dark Mode)**: تم تعيين `default_theme = 'dark'` كإعداد افتراضي
2. **رقم الهاتف**: `+249123044745` (معرض الفخيم للسيارات)
3. **الموقع**: بورتسودان، السودان
4. **التغييرات التلقائية**: يتم تسجيل جميع التغييرات في الإعدادات تلقائياً
5. **الأمان**: جميع الجداول محمية بـ RLS policies

---

## 🚀 الخطوات التالية / Next Steps

1. ✅ إنشاء واجهة إدارة لتتبع التغييرات
2. ✅ إضافة نظام إشعارات للطلبات الجديدة
3. ✅ تطوير لوحة تحكم لإدارة الطلبات
4. ✅ إضافة تقارير إحصائية للطلبات
5. ✅ تكامل مع نظام CRM

---

## 📞 الدعم / Support

للمزيد من المعلومات أو المساعدة، يرجى التواصل:
- 📱 الهاتف: +249123044745
- 📧 البريد الإلكتروني: info@alfakhim.com
- 📍 الموقع: بورتسودان، السودان

---

**آخر تحديث / Last Updated**: 2026-02-02
**الإصدار / Version**: 1.0.0
