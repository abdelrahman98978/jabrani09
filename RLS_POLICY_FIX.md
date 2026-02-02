# 🔒 إصلاح سياسات RLS للطلبات
# Orders RLS Policy Fix

**التاريخ / Date:** 2026-02-02  
**الإصدار / Version:** 2.1.1

---

## ❌ المشكلة / Problem

عند محاولة إنشاء طلب من قبل زائر غير مسجل، كان يظهر الخطأ التالي:

```
Failed to submit order
new row violates row-level security policy for table "orders"
```

### السبب / Root Cause:

كانت هناك سياسة RLS تتطلب:
```sql
WITH CHECK (auth.uid() = user_id)
```

هذه السياسة تفشل عندما:
- الزائر غير مسجل (`auth.uid()` = NULL)
- `user_id` في الطلب = NULL
- NULL ≠ NULL في SQL (يعطي NULL وليس TRUE)

---

## ✅ الحل / Solution

### 1. حذف السياسات المتضاربة:
```sql
DROP POLICY IF EXISTS "Authenticated users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Allow insert orders with customer_id" ON public.orders;
```

### 2. إنشاء سياسة جديدة شاملة:
```sql
CREATE POLICY "Allow anyone to create orders"
ON public.orders
FOR INSERT
TO public
WITH CHECK (
  customer_id IS NOT NULL
  AND (
    -- إما أن يكون مستخدم مسجل ويطابق user_id
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
    -- أو زائر غير مسجل (user_id = NULL)
    OR (auth.uid() IS NULL AND user_id IS NULL)
  )
);
```

---

## 🎯 كيف تعمل السياسة الجديدة / How It Works

### الحالة 1: مستخدم مسجل (Authenticated User)
```
auth.uid() = "abc-123"
user_id = "abc-123"
customer_id = "xyz-789"

✅ PASS: auth.uid() IS NOT NULL AND auth.uid() = user_id
```

### الحالة 2: زائر غير مسجل (Guest User)
```
auth.uid() = NULL
user_id = NULL
customer_id = "xyz-789"

✅ PASS: auth.uid() IS NULL AND user_id IS NULL
```

### الحالة 3: محاولة احتيال (Fraud Attempt)
```
auth.uid() = NULL
user_id = "someone-else-id"
customer_id = "xyz-789"

❌ FAIL: لا يطابق أي من الشرطين
```

---

## 🔐 الأمان / Security

### ما تم الحفاظ عليه:
✅ **customer_id مطلوب دائماً** - لا يمكن إنشاء طلب بدون عميل  
✅ **المستخدمون المسجلون** - يجب أن يطابق `user_id` مع `auth.uid()`  
✅ **الزوار** - يمكنهم إنشاء طلبات مع `user_id = NULL`  
✅ **منع الاحتيال** - لا يمكن لزائر انتحال هوية مستخدم آخر  

### ما تم إزالته:
❌ السياسة الخطرة `WITH CHECK (true)` - تم حذفها سابقاً  
❌ السياسات المتضاربة - تم دمجها في سياسة واحدة  

---

## 📊 السياسات النهائية / Final Policies

### سياسات INSERT:
```sql
"Allow anyone to create orders" (INSERT)
  WITH CHECK: customer_id IS NOT NULL 
              AND ((auth.uid() IS NOT NULL AND auth.uid() = user_id) 
                   OR (auth.uid() IS NULL AND user_id IS NULL))
```

### سياسات SELECT:
```sql
"Users can view own orders" (SELECT)
  USING: auth.uid() = user_id

"Admins can view all orders" (SELECT)
  USING: EXISTS (SELECT 1 FROM user_roles 
                 WHERE user_id = auth.uid() 
                 AND role = 'admin')
```

### سياسات UPDATE:
```sql
"Admins can update all orders" (UPDATE)
  USING: EXISTS (SELECT 1 FROM user_roles 
                 WHERE user_id = auth.uid() 
                 AND role = 'admin')
```

### سياسات ALL:
```sql
"Admins can manage orders" (ALL)
  USING: has_role(auth.uid(), 'admin')
```

---

## 🧪 اختبار / Testing

### اختبار 1: زائر يطلب سيارة
```javascript
// Guest user (not logged in)
const { data, error } = await supabase
  .from("orders")
  .insert({
    customer_id: "customer-uuid",
    user_id: null,  // Guest
    car_id: "car-uuid",
    total_amount: 50000,
    // ... other fields
  });

// ✅ Expected: Success
```

### اختبار 2: مستخدم مسجل يطلب سيارة
```javascript
// Authenticated user
const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await supabase
  .from("orders")
  .insert({
    customer_id: "customer-uuid",
    user_id: user.id,  // Authenticated
    car_id: "car-uuid",
    total_amount: 50000,
    // ... other fields
  });

// ✅ Expected: Success
```

### اختبار 3: محاولة احتيال
```javascript
// Guest trying to impersonate
const { data, error } = await supabase
  .from("orders")
  .insert({
    customer_id: "customer-uuid",
    user_id: "someone-else-uuid",  // ❌ Fraud
    car_id: "car-uuid",
    total_amount: 50000,
  });

// ❌ Expected: RLS policy violation
```

---

## 📝 ملاحظات مهمة / Important Notes

### 1. دالة `get_or_create_customer`
تستخدم في `CheckoutDialog.tsx`:
```typescript
const { data: customerId } = await supabase
  .rpc('get_or_create_customer', {
    p_name: formData.customerName,
    p_phone: formData.customerPhone,
    p_email: formData.customerEmail || null,
    p_user_id: user?.id || null,  // NULL للزوار
  });
```

### 2. تدفق إنشاء الطلب / Order Creation Flow
```
1. المستخدم يملأ النموذج
   ↓
2. get_or_create_customer() → customer_id
   ↓
3. إنشاء الطلب مع:
   - customer_id (مطلوب)
   - user_id (NULL للزوار، UUID للمسجلين)
   ↓
4. RLS Policy تتحقق:
   - customer_id موجود ✓
   - إما (مسجل + user_id صحيح) أو (زائر + user_id = NULL) ✓
   ↓
5. ✅ نجاح الطلب
```

### 3. الفرق بين customer_id و user_id

| Field | Purpose | Required | Can be NULL |
|-------|---------|----------|-------------|
| `customer_id` | معلومات العميل (اسم، هاتف، إلخ) | ✅ نعم | ❌ لا |
| `user_id` | ربط بحساب المستخدم | ❌ لا | ✅ نعم (للزوار) |

---

## 🚀 النتيجة / Result

### قبل الإصلاح:
❌ الزوار لا يستطيعون إنشاء طلبات  
❌ خطأ RLS policy violation  
❌ تجربة مستخدم سيئة  

### بعد الإصلاح:
✅ الزوار يستطيعون إنشاء طلبات  
✅ المستخدمون المسجلون يستطيعون إنشاء طلبات  
✅ الأمان محفوظ  
✅ تجربة مستخدم ممتازة  

---

## 📚 المراجع / References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [SQL NULL Handling](https://www.postgresql.org/docs/current/functions-comparison.html)

---

**تم بحمد الله ✨**  
**Successfully Completed ✨**
