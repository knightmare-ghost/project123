# 📦 Frontend Modularity & Folder Structure (Next.js)

## ✨ Objective
We adopt the **default Next.js structure** for routing, file organization, and project layout.  
However, for **data access**, **business logic**, and **data types**, we introduce a clear separation of concerns using dedicated folders:

- `repository/` for API calls (data access)
- `services/` for business logic
- `types/` for TypeScript interfaces and type definitions

This structure promotes maintainability, scalability, and cleaner abstractions across the application.

---

## 🧱 Project Structure (Overview)

```
/src
│
├── /pages                  # Next.js pages (routes)
│
├── /components             # Reusable UI components
│
├── /repository             # API calls (one file per resource)
│   ├── user.repository.ts
│   ├── auth.repository.ts
│   └── ...
│
├── /services               # Business logic (one file per domain)
│   ├── user.service.ts
│   ├── auth.service.ts
│   └── ...
│
├── /types                  # Data types/interfaces (one file per resource)
│   ├── user.types.ts
│   ├── auth.types.ts
│   └── ...
│
├── /hooks                  # Custom hooks
│
├── /utils                  # Utility functions/helpers
│
├── /constants              # Global constants
│
├── /config                 # App configs (e.g. Axios, env)
│
├── /styles                 # Global styles
│
└── /assets                 # Images, fonts, etc.
```

---

## 🧩 Roles of Key Folders

### ✅ `/repository` — Data Access Layer
- **Purpose**: Responsible for all direct API calls.
- **Structure**: One file per resource.
- **Example**:
```ts
// user.repository.ts
import axios from '@/config/axios';
import { User } from '@/types/user.types';

export const fetchUser = async (id: string): Promise<User> => {
  const res = await axios.get(`/users/${id}`);
  return res.data;
};
```

---

### ✅ `/services` — Business Logic Layer
- **Purpose**: Processes, combines, or transforms data from the repository.
- **Structure**: One file per domain/feature.
- **Example**:
```ts
// user.service.ts
import { fetchUser } from '@/repository/user.repository';

export const getUserDisplayName = async (id: string) => {
  const user = await fetchUser(id);
  return \`\${user.firstName} \${user.lastName}\`;
};
```

---

### ✅ `/types` — Types & Interfaces
- **Purpose**: Houses all TypeScript interfaces and types. Typescript utility types should be used where all fields in a type is not required.
- **Structure**: One file per resource.
- **Example**:
```ts
// user.types.ts
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
```

---

## 🧬 Modular Philosophy

- Each **feature** has its corresponding logic split into:
  - `repository/feature.repository.ts`
  - `services/feature.service.ts`
  - `types/feature.types.ts`

- Keep **UI logic** in components, and **data logic** in services/repositories.

---

