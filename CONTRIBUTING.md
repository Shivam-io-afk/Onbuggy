# Contributing to Onbuggy 🛒

Thank you for your interest in contributing to **Onbuggy**! We welcome bug reports, feature enhancements, documentation improvements, and UI refinements.

---

## 🛠️ Local Development Setup

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/Shivam-io-afk/Onbuggy.git
   cd onbuggy
   ```
2. Install all dependencies across root, server, and client:
   ```bash
   npm run install:all
   ```
3. Ensure MongoDB is active locally (`mongodb://127.0.0.1:27017`) and seed initial data:
   ```bash
   npm run seed
   ```
4. Start both development servers concurrently:
   ```bash
   npm run dev
   ```

---

## 🌿 Git Branching Convention

Always create a dedicated feature branch from `main`:

* **Features**: `feat/store-reviews-system`
* **Fixes**: `fix/coupon-calculation-rounding`
* **Documentation**: `docs/update-api-reference`
* **Refactoring**: `refactor/order-state-machine`

---

## 💬 Commit Message Guidelines

We adhere to **Conventional Commits**:

```text
<type>(<scope>): <short description>

[optional body]
```

### Types:
* `feat`: A new user-facing feature.
* `fix`: A bug fix.
* `docs`: Documentation updates.
* `style`: Code styling, formatting, or missing semicolons (no code changes).
* `refactor`: Code reorganization with no functional change.
* `test`: Adding or updating test cases.

**Examples**:
* `feat(checkout): add support for UPI QR code payment`
* `fix(auth): prevent duplicate account creation on rapid clicks`
* `docs(readme): add docker-compose deployment guide`

---

## 💻 TypeScript & React Conventions

1. **Strict Types**: Always define explicit interfaces in `src/types/index.ts`. Avoid `any` whenever possible.
2. **Functional Components**: Use standard `React.FC<Props>` or pure functions with TypeScript interface props.
3. **Async / Await**: Use `try / catch` blocks for asynchronous network requests.
4. **CSS & Styling**: Use theme tokens defined in `src/styles/index.css` (`var(--primary)`, `var(--dark)`, etc.) to preserve visual brand consistency.

---

## 📋 Pull Request Checklist

Before submitting a PR, verify:
- [ ] `npm run build` passes on both server and client without TypeScript compilation errors.
- [ ] New endpoints are documented in `API_DOCUMENTATION.md`.
- [ ] Database model changes are reflected in `DATABASE_SCHEMA.md`.
- [ ] Code is formatted cleanly without leftover debug `console.log` statements.

