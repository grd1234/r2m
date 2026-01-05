# Password Visibility Toggle - Implementation Guide

## ✅ What's Been Added

A reusable **PasswordInput** component with eye icon toggle for showing/hiding passwords.

---

## Component Location

**File:** `src/components/ui/password-input.tsx`

---

## Features

✅ **Eye icon toggle** - Click to show/hide password
✅ **Lock icon** - Visual indicator for password field
✅ **Hover effects** - Eye icon changes color on hover
✅ **Accessibility** - Proper ARIA labels for screen readers
✅ **Reusable** - Can be used across all login/signup pages

---

## Usage Example

### **Already Implemented:**
- ✅ Innovator Login (`/login/innovator`)

### **To Add to Other Pages:**

1. **Import the component:**
```tsx
import { PasswordInput } from '@/components/ui/password-input'
```

2. **Replace old password input:**

**Before:**
```tsx
<Input
  type="password"
  value={formData.password}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  placeholder="••••••••"
  required
  className="h-14 pl-12 text-base"
/>
```

**After:**
```tsx
<PasswordInput
  value={formData.password}
  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
  placeholder="••••••••"
  required
  className="h-14 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
/>
```

3. **Remove manual password visibility state** (if you added it):
```tsx
// DELETE these lines:
const [showPassword, setShowPassword] = useState(false)
import { Eye, EyeOff } from 'lucide-react'
```

---

## Component Props

```tsx
interface PasswordInputProps {
  showIcon?: boolean  // Show/hide lock icon (default: true)
  className?: string  // Custom CSS classes
  // ... all standard input props (value, onChange, placeholder, etc.)
}
```

---

## Apply to All Pages

### **Login Pages:**
- ✅ `/login/innovator` - Already done
- ⬜ `/login/investor`
- ⬜ `/login/researcher`
- ⬜ `/login` (general)

### **Signup Pages:**
- ⬜ `/signup/innovator`
- ⬜ `/signup/investor`
- ⬜ `/signup/researcher`

---

## Quick Update Script

To apply to all pages quickly, search for:
```tsx
type="password"
```

And replace the entire input field with:
```tsx
<PasswordInput ... />
```

---

## Visual Preview

**Password Hidden (default):**
```
┌─────────────────────────────────────────┐
│ 🔒  ••••••••                         👁  │
└─────────────────────────────────────────┘
```

**Password Visible (after clicking eye):**
```
┌─────────────────────────────────────────┐
│ 🔒  MyPassword123                  👁‍🗨 │
└─────────────────────────────────────────┘
```

---

## Icons Used

- **Lock** (`🔒`) - Left side, indicates password field
- **Eye** (`👁`) - Right side, click to show password
- **EyeOff** (`👁‍🗨`) - Right side, click to hide password

---

## Testing

1. Go to http://localhost:3000/login/innovator
2. Click in the password field
3. Type a password
4. Click the eye icon → password should become visible
5. Click again → password should be hidden
6. Hover over eye icon → it should change color (gray → darker gray)

---

## Next Steps

Would you like me to:
1. Apply this to **ALL** login pages automatically?
2. Apply this to **ALL** signup pages automatically?
3. Both?

Just let me know and I'll update all the pages for you!
